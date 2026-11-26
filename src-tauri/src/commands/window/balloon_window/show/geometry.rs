#[cfg(any(desktop, test))]
#[derive(Debug, Clone, Copy, PartialEq)]
pub(super) struct LogicalWorkArea {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub mon_x: f64,
    pub mon_y: f64,
    pub mon_width: f64,
    pub mon_height: f64,
    pub scale_factor: f64,
}

#[cfg(any(desktop, test))]
impl LogicalWorkArea {
    #[allow(clippy::too_many_arguments)]
    pub fn from_physical_rects(
        work_x: i32,
        work_y: i32,
        work_w: u32,
        work_h: u32,
        mon_x: i32,
        mon_y: i32,
        mon_w: u32,
        mon_h: u32,
        scale_factor: f64,
    ) -> Self {
        let safe_scale = safe_scale_factor(scale_factor);
        Self {
            x: work_x as f64 / safe_scale,
            y: work_y as f64 / safe_scale,
            width: work_w as f64 / safe_scale,
            height: work_h as f64 / safe_scale,
            mon_x: mon_x as f64 / safe_scale,
            mon_y: mon_y as f64 / safe_scale,
            mon_width: mon_w as f64 / safe_scale,
            mon_height: mon_h as f64 / safe_scale,
            scale_factor: safe_scale,
        }
    }

    pub fn default_fallback() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            width: 1920.0,
            height: 1080.0,
            mon_x: 0.0,
            mon_y: 0.0,
            mon_width: 1920.0,
            mon_height: 1080.0,
            scale_factor: 1.0,
        }
    }
}

#[cfg(any(desktop, test))]
pub fn safe_scale_factor(scale: f64) -> f64 {
    if scale > 0.0 && scale.is_finite() {
        scale
    } else {
        1.0
    }
}

/// バルーンの論理座標をクランプする（X軸は無制限、Y軸のみタスクバー除外ワークスペース内に絶対クランプ）
#[cfg(any(desktop, test))]
pub(super) fn clamp_logical_position_y_only(
    x: f64,
    y: f64,
    height: f64,
    work_y: f64,
    work_h: f64,
) -> (f64, f64) {
    let clamped_y = if !y.is_finite() || !height.is_finite() || work_h <= 0.0 || height >= work_h {
        work_y
    } else {
        let max_y = (work_y + work_h - height).max(work_y);
        y.clamp(work_y, max_y)
    };
    (x, clamped_y)
}

#[cfg(any(desktop, test))]
pub(super) fn needs_vertical_clamp(y: f64, height: f64, work_y: f64, work_h: f64) -> bool {
    if !y.is_finite() {
        return true;
    }
    let (_, clamped_y) = clamp_logical_position_y_only(0.0, y, height, work_y, work_h);
    (clamped_y - y).abs() > 1e-6
}

#[cfg(any(desktop, test))]
pub fn select_best_rect_index(rects: &[(f64, f64, f64, f64)], x: f64, y: f64) -> Option<usize> {
    if rects.is_empty() {
        return None;
    }
    if let Some((idx, _)) = rects
        .iter()
        .enumerate()
        .find(|(_, (rx, ry, rw, rh))| x >= *rx && x < *rx + *rw && y >= *ry && y < *ry + *rh)
    {
        return Some(idx);
    }
    rects
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| {
            let dist = |(rx, ry, rw, rh): &(f64, f64, f64, f64)| -> (f64, f64) {
                let dx = if x < *rx {
                    *rx - x
                } else if x > *rx + *rw {
                    x - (*rx + *rw)
                } else {
                    0.0
                };
                let dy = if y < *ry {
                    *ry - y
                } else if y > *ry + *rh {
                    y - (*ry + *rh)
                } else {
                    0.0
                };
                (dx, dy)
            };
            dist(a)
                .partial_cmp(&dist(b))
                .unwrap_or(std::cmp::Ordering::Equal)
        })
        .map(|(idx, _)| idx)
}

#[cfg(desktop)]
pub(super) fn monitor_logical_work_area(monitor: &tauri::Monitor) -> LogicalWorkArea {
    let work = monitor.work_area();
    let pos = monitor.position();
    let size = monitor.size();
    LogicalWorkArea::from_physical_rects(
        work.position.x,
        work.position.y,
        work.size.width,
        work.size.height,
        pos.x,
        pos.y,
        size.width,
        size.height,
        monitor.scale_factor(),
    )
}

#[cfg(desktop)]
pub(super) fn window_scale_factor(win: &tauri::WebviewWindow, fallback: f64) -> f64 {
    win.scale_factor()
        .ok()
        .filter(|s| *s > 0.0 && s.is_finite())
        .or_else(|| {
            win.current_monitor()
                .ok()
                .flatten()
                .map(|m| m.scale_factor())
                .filter(|s| *s > 0.0 && s.is_finite())
        })
        .unwrap_or_else(|| safe_scale_factor(fallback))
}

#[cfg(desktop)]
pub(super) fn select_monitor_for_physical_point(
    app_handle: &tauri::AppHandle,
    px: f64,
    py: f64,
) -> Option<tauri::Monitor> {
    let monitors = app_handle.available_monitors().ok()?;
    let rects: Vec<(f64, f64, f64, f64)> = monitors
        .iter()
        .map(|m| {
            let p = m.position();
            let s = m.size();
            (p.x as f64, p.y as f64, s.width as f64, s.height as f64)
        })
        .collect();
    select_best_rect_index(&rects, px, py).and_then(|idx| monitors.into_iter().nth(idx))
}

#[cfg(desktop)]
pub(super) fn select_monitor_for_logical_point(
    app_handle: &tauri::AppHandle,
    lx: f64,
    ly: f64,
) -> Option<tauri::Monitor> {
    let monitors = app_handle.available_monitors().ok()?;
    let rects: Vec<(f64, f64, f64, f64)> = monitors
        .iter()
        .map(|m| {
            let area = monitor_logical_work_area(m);
            (area.mon_x, area.mon_y, area.mon_width, area.mon_height)
        })
        .collect();
    select_best_rect_index(&rects, lx, ly).and_then(|idx| monitors.into_iter().nth(idx))
}

#[cfg(desktop)]
pub(super) fn monitor_from_window_center(
    app_handle: &tauri::AppHandle,
    win: &tauri::WebviewWindow,
) -> Option<tauri::Monitor> {
    win.current_monitor().ok().flatten().or_else(|| {
        let pos = win.outer_position().ok()?;
        let size = win.outer_size().ok()?;
        let cx = pos.x as f64 + (size.width as f64) / 2.0;
        let cy = pos.y as f64 + (size.height as f64) / 2.0;
        select_monitor_for_physical_point(app_handle, cx, cy)
    })
}

#[cfg(any(desktop, test))]
pub(super) fn compute_default_logical_balloon_pos(
    scope_id: i32,
    char_x: f64,
    char_y: f64,
    char_width: f64,
    balloon_width: f64,
    work_x: f64,
    work_w: f64,
) -> (f64, f64) {
    let raw_x = if scope_id == 0 {
        let overflows_right = char_x + char_width - 10.0 + balloon_width > work_x + work_w;
        if overflows_right {
            char_x - balloon_width + 10.0
        } else {
            char_x + char_width - 20.0
        }
    } else {
        char_x - balloon_width + 20.0
    };
    (raw_x, char_y - 20.0)
}

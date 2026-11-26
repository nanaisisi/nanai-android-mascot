use super::types::{PhysicalWorkArea, safe_scale_factor};

/// バルーンの物理座標をクランプする（X軸は無制限、Y軸のみタスクバー除外ワークスペース内に絶対クランプ）
pub(super) fn clamp_physical_position_y_only(
    x: i32,
    y: i32,
    height: i32,
    work_y: i32,
    work_h: i32,
) -> (i32, i32) {
    let clamped_y = if work_h <= 0 || height >= work_h {
        work_y
    } else {
        let max_y = work_y
            .saturating_add(work_h)
            .saturating_sub(height)
            .max(work_y);
        y.clamp(work_y, max_y)
    };
    (x, clamped_y)
}

pub(super) fn select_best_physical_monitor_index(
    areas: &[PhysicalWorkArea],
    px: i32,
    py: i32,
) -> Option<usize> {
    if areas.is_empty() {
        return None;
    }
    if let Some((idx, _)) = areas.iter().enumerate().find(|(_, a)| {
        px >= a.mon_x
            && px < a.mon_x.saturating_add(a.mon_width)
            && py >= a.mon_y
            && py < a.mon_y.saturating_add(a.mon_height)
    }) {
        return Some(idx);
    }
    areas
        .iter()
        .enumerate()
        .min_by_key(|(_, a)| {
            let max_x = a.mon_x.saturating_add(a.mon_width);
            let max_y = a.mon_y.saturating_add(a.mon_height);
            let dx: i64 = if px < a.mon_x {
                (a.mon_x as i64) - (px as i64)
            } else if px > max_x {
                (px as i64) - (max_x as i64)
            } else {
                0
            };
            let dy: i64 = if py < a.mon_y {
                (a.mon_y as i64) - (py as i64)
            } else if py > max_y {
                (py as i64) - (max_y as i64)
            } else {
                0
            };
            (dx, dy)
        })
        .map(|(idx, _)| idx)
}

pub(super) fn select_monitor_for_physical_point(
    app_handle: &tauri::AppHandle,
    px: i32,
    py: i32,
) -> Option<tauri::Monitor> {
    let monitors = app_handle.available_monitors().ok()?;
    let areas: Vec<PhysicalWorkArea> = monitors
        .iter()
        .map(PhysicalWorkArea::from_monitor)
        .collect();
    select_best_physical_monitor_index(&areas, px, py).and_then(|idx| monitors.into_iter().nth(idx))
}

pub(super) fn monitor_from_window_center(
    app_handle: &tauri::AppHandle,
    win: &tauri::WebviewWindow,
) -> Option<tauri::Monitor> {
    win.current_monitor().ok().flatten().or_else(|| {
        let pos = win.outer_position().ok()?;
        let size = win.outer_size().ok()?;
        let cx = pos.x.saturating_add((size.width as i32) / 2);
        let cy = pos.y.saturating_add((size.height as i32) / 2);
        select_monitor_for_physical_point(app_handle, cx, cy)
    })
}

pub(super) fn resolve_default_window_physical_size(
    size: tauri::PhysicalSize<u32>,
    base_logical_w: f64,
    base_logical_h: f64,
    scale_factor: f64,
) -> tauri::PhysicalSize<u32> {
    if size.width > 0 && size.height > 0 {
        size
    } else {
        let safe_scale = safe_scale_factor(scale_factor);
        tauri::PhysicalSize {
            width: (base_logical_w * safe_scale).round().max(1.0) as u32,
            height: (base_logical_h * safe_scale).round().max(1.0) as u32,
        }
    }
}

pub(super) fn compute_saved_offset_and_clamped_y(
    char_pos_x: i32,
    char_pos_y: i32,
    balloon_pos_x: i32,
    balloon_pos_y: i32,
    balloon_height: i32,
    work_area: Option<&PhysicalWorkArea>,
) -> ((i32, i32), Option<(i32, i32)>) {
    let clamped_y = if let Some(work) = work_area {
        clamp_physical_position_y_only(
            balloon_pos_x,
            balloon_pos_y,
            balloon_height,
            work.y,
            work.height,
        )
        .1
    } else {
        balloon_pos_y
    };
    let moved_pos = if clamped_y != balloon_pos_y {
        Some((balloon_pos_x, clamped_y))
    } else {
        None
    };
    (
        (balloon_pos_x - char_pos_x, clamped_y - char_pos_y),
        moved_pos,
    )
}

#[allow(clippy::too_many_arguments)]
pub(super) fn compute_default_balloon_offset(
    scope_id: i32,
    char_pos_x: i32,
    char_width: i32,
    balloon_width: i32,
    work_x: Option<i32>,
    work_w: Option<i32>,
    scale_factor: f64,
) -> (i32, i32) {
    let safe_scale = safe_scale_factor(scale_factor);
    let overlap_10 = (10.0 * safe_scale).round() as i32;
    let gap_20 = (20.0 * safe_scale).round() as i32;
    if scope_id == 0 {
        let overflows_right = match (work_x, work_w) {
            (Some(wx), Some(ww)) => char_pos_x + char_width - overlap_10 + balloon_width > wx + ww,
            _ => false,
        };
        if overflows_right {
            (-balloon_width + overlap_10, -gap_20)
        } else {
            (char_width - gap_20, -gap_20)
        }
    } else {
        (-balloon_width + gap_20, -gap_20)
    }
}

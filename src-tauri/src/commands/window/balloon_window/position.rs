#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct SetBalloonOffsetParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
    x: Option<i32>,
    y: Option<i32>,
}

impl SetBalloonOffsetParams {
    pub fn scope_id(&self) -> Option<i32> {
        self.scope_id
    }

    pub fn x(&self) -> Option<i32> {
        self.x
    }

    pub fn y(&self) -> Option<i32> {
        self.y
    }
}

#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
pub async fn set_balloon_offset(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    params: Option<SetBalloonOffsetParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    x: Option<i32>,
    y: Option<i32>,
) -> Result<(), String> {
    let resolved_params = params.unwrap_or_default();
    let target_scope = resolved_params
        .scope_id()
        .or(scope_id)
        .or(scopeId)
        .unwrap_or(0);
    let target_x = resolved_params.x().or(x).unwrap_or(0);
    let target_y = resolved_params.y().or(y).unwrap_or(0);
    state
        .balloon_offsets
        .lock()
        .insert(target_scope, (target_x, target_y));
    sync_balloon_position_impl(&app_handle, &state, target_scope).await
}

#[derive(Debug, Clone, Copy, PartialEq)]
struct PhysicalWorkArea {
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    mon_x: i32,
    mon_y: i32,
    mon_width: i32,
    mon_height: i32,
    scale_factor: f64,
}

impl PhysicalWorkArea {
    #[allow(clippy::too_many_arguments)]
    fn from_rects(
        work_x: i32,
        work_y: i32,
        work_w: i32,
        work_h: i32,
        mon_x: i32,
        mon_y: i32,
        mon_w: i32,
        mon_h: i32,
        scale_factor: f64,
    ) -> Self {
        Self {
            x: work_x,
            y: work_y,
            width: work_w,
            height: work_h,
            mon_x,
            mon_y,
            mon_width: mon_w,
            mon_height: mon_h,
            scale_factor: safe_scale_factor(scale_factor),
        }
    }

    fn from_monitor(monitor: &tauri::Monitor) -> Self {
        let work = monitor.work_area();
        let pos = monitor.position();
        let size = monitor.size();
        Self::from_rects(
            work.position.x,
            work.position.y,
            work.size.width as i32,
            work.size.height as i32,
            pos.x,
            pos.y,
            size.width as i32,
            size.height as i32,
            monitor.scale_factor(),
        )
    }
}

fn safe_scale_factor(scale: f64) -> f64 {
    if scale > 0.0 && scale.is_finite() {
        scale
    } else {
        1.0
    }
}

/// バルーンの物理座標をクランプする（X軸は無制限、Y軸のみタスクバー除外ワークスペース内に絶対クランプ）
fn clamp_physical_position_y_only(
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

fn select_best_physical_monitor_index(
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

fn select_monitor_for_physical_point(
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

fn monitor_from_window_center(
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

fn resolve_default_window_physical_size(
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

fn compute_saved_offset_and_clamped_y(
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
fn compute_default_balloon_offset(
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

pub async fn sync_balloon_position_impl(
    app_handle: &tauri::AppHandle,
    state: &tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    use tauri::Manager;
    let char_label = format!("subchar_window_{}", scope_id);
    let balloon_label = format!("balloon_window_{}", scope_id);
    let (Some(char_win), Some(balloon_win)) = (
        app_handle.get_webview_window(&char_label),
        app_handle.get_webview_window(&balloon_label),
    ) else {
        return Ok(());
    };
    let Ok(char_pos) = char_win.outer_position() else {
        return Ok(());
    };

    let char_monitor_opt = monitor_from_window_center(app_handle, &char_win)
        .or_else(|| monitor_from_window_center(app_handle, &balloon_win))
        .or_else(|| app_handle.primary_monitor().ok().flatten());
    let char_work_area = char_monitor_opt
        .as_ref()
        .map(PhysicalWorkArea::from_monitor);
    let char_scale = char_win
        .scale_factor()
        .ok()
        .filter(|s| *s > 0.0 && s.is_finite())
        .or_else(|| char_work_area.map(|w| w.scale_factor))
        .unwrap_or(1.0);
    let balloon_scale = balloon_win
        .scale_factor()
        .ok()
        .filter(|s| *s > 0.0 && s.is_finite())
        .or_else(|| char_work_area.map(|w| w.scale_factor))
        .unwrap_or(char_scale);

    let char_size = resolve_default_window_physical_size(
        char_win.outer_size().unwrap_or(tauri::PhysicalSize {
            width: 0,
            height: 0,
        }),
        200.0,
        360.0,
        char_scale,
    );
    let balloon_size = resolve_default_window_physical_size(
        balloon_win.outer_size().unwrap_or(tauri::PhysicalSize {
            width: 0,
            height: 0,
        }),
        280.0,
        200.0,
        balloon_scale,
    );

    // デフォルト位置計算:
    // メインキャラ (scope 0): 右側配置（ワークスペース右端あふれる場合は左側に反転）
    // サブキャラ (scope 1以降): 左側配置 (鏡像レイアウト)
    let default_offset = compute_default_balloon_offset(
        scope_id,
        char_pos.x,
        char_size.width as i32,
        balloon_size.width as i32,
        char_work_area.map(|w| w.x),
        char_work_area.map(|w| w.width),
        char_work_area.map(|w| w.scale_factor).unwrap_or(char_scale),
    );

    let offset = state
        .balloon_offsets
        .lock()
        .get(&scope_id)
        .copied()
        .unwrap_or(default_offset);

    let raw_x = char_pos.x.saturating_add(offset.0);
    let raw_y = char_pos.y.saturating_add(offset.1);
    let target_center_x = raw_x.saturating_add((balloon_size.width as i32) / 2);
    let target_center_y = raw_y.saturating_add((balloon_size.height as i32) / 2);
    let target_monitor_opt =
        select_monitor_for_physical_point(app_handle, target_center_x, target_center_y)
            .or(char_monitor_opt);
    let target_work_area = target_monitor_opt
        .as_ref()
        .map(PhysicalWorkArea::from_monitor);

    let (target_x, target_y) = if let Some(work) = target_work_area {
        clamp_physical_position_y_only(
            raw_x,
            raw_y,
            balloon_size.height as i32,
            work.y,
            work.height,
        )
    } else {
        (raw_x, raw_y)
    };

    balloon_win
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: target_x,
            y: target_y,
        }))
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn sync_balloon_position(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    sync_balloon_position_impl(&app_handle, &state, scope_id).await
}

#[tauri::command]
pub async fn reset_balloon_positions(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
) -> Result<(), String> {
    state.balloon_offsets.lock().clear();
    let n = *state.num_characters.lock();
    let max_scopes = if n > 0 { n } else { 1 };
    for scope_id in 0..max_scopes {
        let _ = sync_balloon_position_impl(&app_handle, &state, scope_id).await;
    }
    Ok(())
}

#[tauri::command]
pub async fn save_balloon_offset_from_position(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    use tauri::Manager;
    let char_label = format!("subchar_window_{}", scope_id);
    let balloon_label = format!("balloon_window_{}", scope_id);
    let (Some(char_win), Some(balloon_win)) = (
        app_handle.get_webview_window(&char_label),
        app_handle.get_webview_window(&balloon_label),
    ) else {
        return Ok(());
    };
    let (Ok(char_pos), Ok(balloon_pos)) = (char_win.outer_position(), balloon_win.outer_position())
    else {
        return Ok(());
    };

    let monitor_opt = monitor_from_window_center(&app_handle, &balloon_win)
        .or_else(|| monitor_from_window_center(&app_handle, &char_win))
        .or_else(|| app_handle.primary_monitor().ok().flatten());
    let work_area = monitor_opt.as_ref().map(PhysicalWorkArea::from_monitor);
    let balloon_scale = balloon_win
        .scale_factor()
        .ok()
        .filter(|s| *s > 0.0 && s.is_finite())
        .or_else(|| work_area.map(|w| w.scale_factor))
        .unwrap_or(1.0);
    let balloon_size = resolve_default_window_physical_size(
        balloon_win.outer_size().unwrap_or(tauri::PhysicalSize {
            width: 0,
            height: 0,
        }),
        280.0,
        200.0,
        balloon_scale,
    );

    let (offset, moved_pos) = compute_saved_offset_and_clamped_y(
        char_pos.x,
        char_pos.y,
        balloon_pos.x,
        balloon_pos.y,
        balloon_size.height as i32,
        work_area.as_ref(),
    );
    if let Some((nx, ny)) = moved_pos {
        let _ = balloon_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: nx,
            y: ny,
        }));
    }

    state.balloon_offsets.lock().insert(scope_id, offset);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_offset_flips_scope_zero_within_work_area_and_scales_hidpi() {
        assert_eq!(
            compute_default_balloon_offset(0, 100, 200, 280, Some(0), Some(1920), 1.0),
            (180, -20)
        );
        // 右側タスクバーで work_w=1840 の場合もオーバーフローを検知して左側反転
        assert_eq!(
            compute_default_balloon_offset(0, 1400, 200, 280, Some(0), Some(1840), 1.0),
            (-270, -20)
        );
        assert_eq!(
            compute_default_balloon_offset(0, 1640, 200, 280, Some(0), Some(1920), 1.0),
            (-270, -20)
        );
        assert_eq!(
            compute_default_balloon_offset(1, 1400, 200, 280, Some(0), Some(1920), 1.0),
            (-260, -20)
        );

        // HiDPI 2.0x スケーリング
        assert_eq!(
            compute_default_balloon_offset(0, 200, 400, 560, Some(0), Some(3840), 2.0),
            (360, -40)
        );
        assert_eq!(
            compute_default_balloon_offset(0, 3280, 400, 560, Some(0), Some(3840), 2.0),
            (-540, -40)
        );
        assert_eq!(
            compute_default_balloon_offset(1, 200, 400, 560, Some(0), Some(3840), 2.0),
            (-520, -40)
        );
    }

    #[test]
    fn clamp_physical_position_y_only_keeps_x_unrestricted_and_clamps_y_to_work_area() {
        // 通常高さ: Yのみ [0, 1040 - 200 = 840] にクランプ、Xは左右画面外でも維持
        assert_eq!(
            clamp_physical_position_y_only(1700, 950, 200, 0, 1040),
            (1700, 840)
        );
        assert_eq!(
            clamp_physical_position_y_only(-250, -30, 200, 0, 1040),
            (-250, 0)
        );
        assert_eq!(
            clamp_physical_position_y_only(2500, 500, 200, 0, 1040),
            (2500, 500)
        );

        // 非ゼロ work_area.position (上部タスクバー work_y=40, work_h=1000)
        assert_eq!(
            clamp_physical_position_y_only(-120, 10, 200, 40, 1000),
            (-120, 40)
        );
        assert_eq!(
            clamp_physical_position_y_only(-120, 900, 200, 40, 1000),
            (-120, 840)
        );

        // 縦長ウィンドウ (height >= work_height) は work_top に固定、Xは無制限
        assert_eq!(
            clamp_physical_position_y_only(-100, 150, 1200, 40, 1000),
            (-100, 40)
        );
        assert_eq!(
            clamp_physical_position_y_only(2200, 80, 1000, 40, 1000),
            (2200, 40)
        );
    }

    #[test]
    fn save_offset_helper_enforces_vertical_work_area_and_unrestricted_x() {
        // HiDPI 1.5x (物理 work_area: y=60, h=1560 -> work_bottom=1620)
        let work = PhysicalWorkArea::from_rects(0, 60, 2880, 1560, 0, 0, 2880, 1620, 1.5);

        // ドラッグ終了時にタスクバー下端を超えていた場合、YのみクランプされX(-400)と移動先座標が返る
        let (offset_bottom, moved_bottom) =
            compute_saved_offset_and_clamped_y(100, 800, -400, 1400, 300, Some(&work));
        // max_y = 60 + 1560 - 300 = 1320 -> offset = (-400 - 100, 1320 - 800) = (-500, 520)
        assert_eq!(offset_bottom, (-500, 520));
        assert_eq!(moved_bottom, Some((-400, 1320)));

        // 上端より上にドラッグした場合、work_top (60) にクランプ
        let (offset_top, moved_top) =
            compute_saved_offset_and_clamped_y(500, 300, 3100, 10, 300, Some(&work));
        assert_eq!(offset_top, (2600, -290));
        assert_eq!(moved_top, Some((3100, 60)));

        // 範囲内なら移動不要
        let (offset_ok, moved_ok) =
            compute_saved_offset_and_clamped_y(500, 300, -100, 400, 300, Some(&work));
        assert_eq!(offset_ok, (-600, 100));
        assert_eq!(moved_ok, None);
    }

    #[test]
    fn multi_monitor_selection_picks_target_monitor_even_with_unrestricted_x() {
        let m1 = PhysicalWorkArea::from_rects(0, 0, 1920, 1040, 0, 0, 1920, 1080, 1.0);
        let m2 = PhysicalWorkArea::from_rects(1920, 60, 2880, 1560, 1920, 0, 2880, 1620, 1.5);
        let areas = vec![m1, m2];

        assert_eq!(
            select_best_physical_monitor_index(&areas, -200, 500),
            Some(0)
        );
        assert_eq!(
            select_best_physical_monitor_index(&areas, 2100, 20),
            Some(1)
        );
        assert_eq!(
            select_best_physical_monitor_index(&areas, 5000, 500),
            Some(1)
        );
    }
}

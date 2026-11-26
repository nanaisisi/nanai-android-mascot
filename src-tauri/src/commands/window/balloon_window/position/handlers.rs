use super::geometry::{
    compute_default_balloon_offset, compute_saved_offset_and_clamped_y, monitor_from_window_center,
    resolve_default_window_physical_size, select_monitor_for_physical_point,
};
use super::types::{PhysicalWorkArea, SetBalloonOffsetParams};

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

pub(in crate::commands) async fn sync_balloon_position_impl(
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
        super::geometry::clamp_physical_position_y_only(
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

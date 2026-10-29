#[tauri::command]
pub async fn set_balloon_offset(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::AppState>,
    scope_id: i32,
    x: i32,
    y: i32,
) -> Result<(), String> {
    state.balloon_offsets.lock().insert(scope_id, (x, y));
    sync_balloon_position_impl(&app_handle, &state, scope_id).await
}

pub async fn sync_balloon_position_impl(
    app_handle: &tauri::AppHandle,
    state: &tauri::State<'_, crate::common::AppState>,
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
    let offset = state
        .balloon_offsets
        .lock()
        .get(&scope_id)
        .copied()
        .unwrap_or((-40, -180));
    balloon_win
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: char_pos.x + offset.0,
            y: char_pos.y + offset.1,
        }))
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn sync_balloon_position(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    sync_balloon_position_impl(&app_handle, &state, scope_id).await
}

#[tauri::command]
pub async fn save_balloon_offset_from_position(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::AppState>,
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
    state.balloon_offsets.lock().insert(
        scope_id,
        (balloon_pos.x - char_pos.x, balloon_pos.y - char_pos.y),
    );
    Ok(())
}

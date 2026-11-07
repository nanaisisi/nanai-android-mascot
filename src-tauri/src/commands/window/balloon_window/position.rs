#[tauri::command]
pub async fn set_balloon_offset(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
    x: i32,
    y: i32,
) -> Result<(), String> {
    state.balloon_offsets.lock().insert(scope_id, (x, y));
    sync_balloon_position_impl(&app_handle, &state, scope_id).await
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
    let (mut char_size, mut balloon_size) = (
        char_win.outer_size().unwrap_or(tauri::PhysicalSize {
            width: 200,
            height: 360,
        }),
        balloon_win.outer_size().unwrap_or(tauri::PhysicalSize {
            width: 280,
            height: 200,
        }),
    );
    if char_size.width == 0 || char_size.height == 0 {
        char_size = tauri::PhysicalSize {
            width: 200,
            height: 360,
        };
    }
    if balloon_size.width == 0 || balloon_size.height == 0 {
        balloon_size = tauri::PhysicalSize {
            width: 280,
            height: 200,
        };
    }

    // デフォルト位置計算:
    // メインキャラ (scope 0): 右側配置
    // サブキャラ (scope 1以降): 左側配置 (鏡像レイアウト)
    let default_offset = if scope_id == 0 {
        (
            char_size.width as i32 - 20,
            -(balloon_size.height as i32) + 20,
        )
    } else {
        (
            -(balloon_size.width as i32) + 20,
            -(balloon_size.height as i32) + 20,
        )
    };

    let offset = state
        .balloon_offsets
        .lock()
        .get(&scope_id)
        .copied()
        .unwrap_or(default_offset);
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
    state.balloon_offsets.lock().insert(
        scope_id,
        (balloon_pos.x - char_pos.x, balloon_pos.y - char_pos.y),
    );
    Ok(())
}

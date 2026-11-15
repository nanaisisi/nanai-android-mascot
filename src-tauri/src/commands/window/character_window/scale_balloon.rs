//! キャラクターウィンドウ倍率設定およびバルーン位置同期コマンド

#[tauri::command]
pub async fn sync_character_balloon(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    super::super::balloon_window::sync_balloon_position_impl(&app_handle, &state, scope_id).await
}

/// キャラクター（スコープ N）ウィンドウのサイズ変更コマンド（シェル倍率変更用）
#[tauri::command]
pub async fn set_character_scale(
    _app_handle: tauri::AppHandle,
    _scale_percent: u32,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let scale_percent = _scale_percent;
        use tauri::Manager;
        let factor = (scale_percent as f64) / 100.0;
        let win_width = (200.0 * factor).round().max(80.0);
        let win_height = (360.0 * factor).round().max(140.0);
        for (label, win) in app_handle.webview_windows() {
            if label.starts_with("subchar_window_") {
                let _ = win.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                    width: win_width as u32,
                    height: win_height as u32,
                }));
            }
        }
    }
    Ok(())
}

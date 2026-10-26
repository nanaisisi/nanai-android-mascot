use tauri::Manager;

/// デバッグ用のテストコマンド
#[tauri::command]
pub async fn test_command() -> Result<String, String> {
    Ok("SHIORI統合テスト成功!".to_string())
}

/// アプリケーション最小化コマンド
#[tauri::command]
pub async fn minimize_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    if let Some(window) = app_handle.get_webview_window("main") {
        window.minimize().map_err(|e| e.to_string())?;
    }
    #[cfg(not(desktop))]
    let _ = app_handle;
    Ok(())
}

/// アプリケーション終了コマンド
#[tauri::command]
pub async fn exit_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    app_handle.exit(0);
    Ok(())
}

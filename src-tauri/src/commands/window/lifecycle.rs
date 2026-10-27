use tauri::Manager;

/// デバッグ用のテストコマンド
#[tauri::command]
#[specta::specta]
pub async fn test_command() -> Result<String, String> {
    Ok("SHIORI統合テスト成功!".to_string())
}

/// アプリケーション最小化コマンド
#[tauri::command]
pub async fn minimize_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        for (_, window) in app_handle.webview_windows() {
            let _ = window.minimize();
        }
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

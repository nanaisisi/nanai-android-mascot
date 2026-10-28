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

/// メインウィンドウをモーダル表示用に前面表示するコマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_modal_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if let Some(win) = app_handle.get_webview_window("main") {
            let _ = win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 640.0,
                height: 560.0,
            }));
            let _ = win.center();
            let _ = win.unminimize();
            let _ = win.show();
            let _ = win.set_focus();
        }
    }
    Ok(())
}

/// メインウィンドウ（モーダル表示用）を非表示にするコマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn hide_modal_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if let Some(win) = app_handle.get_webview_window("main") {
            let _ = win.hide();
        }
    }
    Ok(())
}

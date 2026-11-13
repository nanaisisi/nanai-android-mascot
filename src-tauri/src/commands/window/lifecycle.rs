use tauri::Manager;
use nanai_android_mascot_ui::ShioriEngine;

/// デバッグ用のテストコマンド
#[tauri::command]
#[specta::specta]
pub async fn test_command() -> Result<String, String> {
    Ok("SHIORI統合テスト成功!".to_string())
}

/// アプリケーション最小化コマンド
#[tauri::command]
pub async fn minimize_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    let state = app_handle.state::<crate::common::state::AppState>();
    *state.is_minimized.lock() = true;
    #[cfg(desktop)]
    {
        for (_, window) in app_handle.webview_windows() {
            let _ = window.hide();
        }
    }
    #[cfg(not(desktop))]
    let _ = app_handle;
    Ok(())
}

/// アプリケーション終了時の一括クリーンアップ
pub fn shutdown_application(app_handle: &tauri::AppHandle) {
    let state = app_handle.state::<crate::common::state::AppState>();
    if let Some(mut engine) = state.shiori_engine.lock().take() {
        let _ = engine.unload();
    }
    let mut engines = state.ghost_engines.lock();
    for (_, mut engine) in engines.drain() {
        let _ = engine.unload();
    }

    #[cfg(windows)]
    {
        let _ = std::process::Command::new("taskkill")
            .args(["/f", "/im", "shiori-host32.exe"])
            .output();
    }
}

/// アプリケーション終了コマンド
#[tauri::command]
pub async fn exit_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    shutdown_application(&app_handle);
    app_handle.exit(0);
    Ok(())
}

/// メインウィンドウをモーダル表示用に前面表示するコマンド
#[tauri::command]
pub async fn show_modal_window(_app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
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
pub async fn hide_modal_window(_app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        if let Some(win) = app_handle.get_webview_window("main") {
            let _ = win.hide();
        }
    }
    Ok(())
}

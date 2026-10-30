/// 起動時・処理中ステータスバナーウィンドウ表示/制御
use tauri::Emitter;

#[tauri::command]
#[allow(unused_variables)]
pub async fn show_loading_banner_window(
    app_handle: tauri::AppHandle,
    ghost_name: Option<String>,
    ghost_version: Option<String>,
) -> Result<(), String> {
    println!(
        "⏳ show_loading_banner_window called: ghost={:?}, version={:?}",
        ghost_name, ghost_version
    );
    #[cfg(desktop)]
    {
        use tauri::Manager;
        // バナーサイズ: 横幅300px, 縦幅90px (約3:2のプロポーション)
        let win_width = 300.0;
        let win_height = 90.0;

        // メニューが右下寄りに表示されるため、左右反対側（左下側）に配置する
        let (target_x, target_y) = if let Ok(Some(monitor)) = app_handle.primary_monitor() {
            let screen_size = monitor.size();
            let screen_pos = monitor.position();
            // 左端 + 24px, 画面下端 - バナー高さ - 24px
            (
                (screen_pos.x as f64) + 24.0,
                (screen_pos.y + screen_size.height as i32) as f64 - win_height - 48.0,
            )
        } else {
            (24.0, 100.0)
        };

        let g_name = ghost_name.unwrap_or_else(|| "Ghost".to_string());
        let g_ver = ghost_version.unwrap_or_else(|| "1.0.0".to_string());

        if let Some(banner_win) = app_handle.get_webview_window("loading_banner_window") {
            let _ = banner_win.set_decorations(false);
            let _ = banner_win.set_shadow(false);
            let _ = banner_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));
            let _ = banner_win.show();
            let _ = banner_win.emit(
                "update-loading-banner",
                serde_json::json!({
                    "name": g_name,
                    "version": g_ver,
                }),
            );
        } else {
            let encoded_name = g_name.replace(' ', "%20").replace('&', "%26");
            let encoded_ver = g_ver.replace(' ', "%20").replace('&', "%26");
            let url = format!(
                "loading-banner.html?name={}&version={}",
                encoded_name, encoded_ver
            );

            let banner_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "loading_banner_window",
                tauri::WebviewUrl::App(url.into()),
            )
            .title("Loading Banner")
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = banner_win.show();
        }
    }
    Ok(())
}

/// 処理中バナーウィンドウ非表示コマンド
#[tauri::command]
pub async fn hide_loading_banner_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        if let Some(banner_win) = app_handle.get_webview_window("loading_banner_window")
            && banner_win.is_visible().map_err(|e| e.to_string())?
        {
            let _ = banner_win.hide();
        }
    }
    #[cfg(not(desktop))]
    let _ = app_handle;
    Ok(())
}

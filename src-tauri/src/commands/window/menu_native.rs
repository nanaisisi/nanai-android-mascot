use tauri::Manager;
#[cfg(desktop)]
use tauri::menu::MenuBuilder;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ShowBalloonContextMenuParams {
    pub scope_id: Option<i32>,
    pub x: Option<f64>,
    pub y: Option<f64>,
}

/// バルーン専用 OS ネイティブコンテキストメニュー表示コマンド
#[tauri::command]
pub async fn show_balloon_context_menu(
    _app_handle: tauri::AppHandle,
    params: ShowBalloonContextMenuParams,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let scope_id = params.scope_id.unwrap_or(0);
        println!(
            "👉 show_balloon_context_menu called: x={:?}, y={:?}, scope=Some({})",
            params.x, params.y, scope_id
        );

        let label = format!("balloon_window_{}", scope_id);
        let subchar_label = format!("subchar_window_{}", scope_id);

        let window = app_handle
            .get_webview_window(&label)
            .or_else(|| app_handle.get_webview_window(&subchar_label))
            .or_else(|| app_handle.get_webview_window("subchar_window_0"))
            .or_else(|| app_handle.get_webview_window("main"))
            .or_else(|| app_handle.webview_windows().into_values().next())
            .ok_or("balloon window not found")?;

        let _ = window.set_focus();

        let menu = MenuBuilder::new(&app_handle)
            .text("balloon-none", "何もしない")
            .separator()
            .text("balloon-leftclick", "左クリックと同じ")
            .text("balloon-break", "スクリプトブレーク")
            .separator()
            .text("balloon-flip", "バルーン左右切替")
            .text("balloon-reset-pos", "バルーン位置調整")
            .text("balloon-move-ghost", "ゴースト本体移動")
            .build()
            .map_err(|e| e.to_string())?;

        let res = if let (Some(px), Some(py)) = (params.x, params.y) {
            let pos = tauri::Position::Logical(tauri::LogicalPosition::new(px, py));
            window.popup_menu_at(&menu, pos)
        } else {
            window.popup_menu(&menu)
        };

        if res.is_err() {
            let _ = window.popup_menu(&menu);
        }
    }
    Ok(())
}

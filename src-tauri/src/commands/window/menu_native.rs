use tauri::Manager;
#[cfg(desktop)]
use tauri::menu::MenuBuilder;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ShowBalloonContextMenuParams {
    pub scope_id: Option<i32>,
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
        let label = format!("balloon_window_{}", scope_id);

        let window = app_handle
            .get_webview_window(&label)
            .or_else(|| app_handle.get_webview_window("main"))
            .ok_or("balloon window not found")?;

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

        window.popup_menu(&menu).map_err(|e| e.to_string())?;
    }
    Ok(())
}

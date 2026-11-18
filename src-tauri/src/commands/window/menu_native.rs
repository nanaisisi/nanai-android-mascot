use std::sync::atomic::{AtomicI32, Ordering};
use tauri::Manager;
#[cfg(desktop)]
use tauri::menu::MenuBuilder;

static LAST_BALLOON_MENU_SCOPE: AtomicI32 = AtomicI32::new(0);

pub fn last_balloon_menu_scope() -> i32 {
    LAST_BALLOON_MENU_SCOPE.load(Ordering::Relaxed)
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ShowBalloonContextMenuParams {
    #[serde(alias = "scopeId")]
    pub scope_id: Option<i32>,
    pub x: Option<f64>,
    pub y: Option<f64>,
}

/// バルーン専用 OS ネイティブコンテキストメニュー表示コマンド
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
pub async fn show_balloon_context_menu(
    _app_handle: tauri::AppHandle,
    params: Option<ShowBalloonContextMenuParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    x: Option<f64>,
    y: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let resolved_params = params.unwrap_or_default();
        let target_scope = resolved_params
            .scope_id
            .or(scope_id)
            .or(scopeId)
            .unwrap_or(0);
        let target_x = resolved_params.x.or(x);
        let target_y = resolved_params.y.or(y);
        LAST_BALLOON_MENU_SCOPE.store(target_scope, Ordering::Relaxed);

        println!(
            "👉 show_balloon_context_menu called: x={:?}, y={:?}, scope=Some({})",
            target_x, target_y, target_scope
        );

        let label = format!("balloon_window_{}", target_scope);
        let subchar_label = format!("subchar_window_{}", target_scope);

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

        let _ = window.popup_menu(&menu);
    }
    Ok(())
}

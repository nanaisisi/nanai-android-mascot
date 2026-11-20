pub mod hide;
pub mod lock;
pub mod params;
pub mod resize;
pub mod show;

pub use params::*;

use hide::execute_hide_balloon_window;
use resize::execute_resize_balloon_window;
use show::execute_show_balloon_window;

/// 独立バルーン（スコープ N）ウィンドウ表示コマンド
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
#[allow(clippy::too_many_arguments)]
pub async fn show_balloon_window(
    app_handle: tauri::AppHandle,
    params: Option<ShowBalloonWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    theme: Option<String>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    execute_show_balloon_window(
        app_handle, params, scope_id, scopeId, theme, x, y, width, height,
    )
    .await
}

/// バルーンウィンドウのサイズを画像実寸法に合せてリサイズするコマンド
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
pub async fn resize_balloon_window(
    app_handle: tauri::AppHandle,
    params: Option<ResizeBalloonWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    execute_resize_balloon_window(app_handle, params, scope_id, scopeId, width, height).await
}

/// 独立バルーン（スコープ N）ウィンドウ非表示コマンド (\b[-1])
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
pub async fn hide_balloon_window(
    app_handle: tauri::AppHandle,
    params: Option<HideBalloonWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    _scope_id: Option<i32>,
) -> Result<(), String> {
    execute_hide_balloon_window(app_handle, params, scope_id, scopeId, _scope_id).await
}

use super::params::{HideBalloonWindowParams, resolve_hide_balloon_scope};

#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
pub async fn execute_hide_balloon_window(
    app_handle: tauri::AppHandle,
    params: Option<HideBalloonWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    _scope_id: Option<i32>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let target_scope = resolve_hide_balloon_scope(params, scope_id, scopeId, _scope_id);
        use tauri::Manager;
        let label = format!("balloon_window_{}", target_scope);
        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            let _ = balloon_win.hide();
        }
    }
    Ok(())
}

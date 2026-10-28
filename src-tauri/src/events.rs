use tauri::{Emitter, Manager};

#[cfg(desktop)]
pub fn handle_menu_event(app_handle: &tauri::AppHandle, event: tauri::menu::MenuEvent) {
    let id = event.id().as_ref();
    if let Some(ghost_name) = id.strip_prefix("ghost:") {
        let _ = app_handle.emit(
            "native-menu-action",
            serde_json::json!({
                "action": "switch-to-ghost",
                "payload": ghost_name
            }),
        );
    } else if let Some(shell_name) = id.strip_prefix("shell:") {
        let _ = app_handle.emit(
            "native-menu-action",
            serde_json::json!({
                "action": "switch-to-shell",
                "payload": shell_name
            }),
        );
    } else if id == "open" || id == "open_menu" {
        let app_h = app_handle.clone();
        tauri::async_runtime::spawn(async move {
            let (x, y) = if let Ok(Some(monitor)) = app_h.primary_monitor() {
                let size = monitor.size();
                let pos = monitor.position();
                (
                    (pos.x + size.width as i32) as f64 - 280.0,
                    (pos.y + size.height as i32) as f64 - 620.0,
                )
            } else {
                (100.0, 100.0)
            };
            let _ = crate::commands::window::show_menu_window(app_h, x, y, Some(0)).await;
        });
    } else if id == "close" || id == "exit" {
        app_handle.exit(0);
    } else {
        let _ = app_handle.emit(
            "native-menu-action",
            serde_json::json!({
                "action": id
            }),
        );
    }
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::Focused(false) = event {
        let label = window.label().to_string();
        if label == "menu_window" || label == "submenu_window" {
            let app = window.app_handle().clone();
            tauri::async_runtime::spawn_blocking(move || {
                std::thread::sleep(std::time::Duration::from_millis(150));
                let menu_focused = app
                    .get_webview_window("menu_window")
                    .map(|w| w.is_focused().unwrap_or(false))
                    .unwrap_or(false);
                let sub_focused = app
                    .get_webview_window("submenu_window")
                    .map(|w| w.is_focused().unwrap_or(false))
                    .unwrap_or(false);

                let state = app.state::<crate::common::AppState>();
                let is_dialog_open = *state.is_dialog_open.lock();

                if !menu_focused && !sub_focused && !is_dialog_open {
                    if let Some(m) = app.get_webview_window("menu_window")
                        && m.is_visible().unwrap_or(false)
                    {
                        let _ = m.hide();
                    }
                    if let Some(s) = app.get_webview_window("submenu_window")
                        && s.is_visible().unwrap_or(false)
                    {
                        let _ = s.hide();
                    }
                }
            });
        }
    }
}

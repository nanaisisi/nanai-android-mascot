use tauri::image::Image;
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};

#[cfg(desktop)]
pub fn setup_tray(app: &tauri::App) -> Result<TrayIcon<tauri::Wry>, tauri::Error> {
    let icon = app
        .default_window_icon()
        .cloned()
        .unwrap_or_else(|| Image::new_owned(vec![0, 0, 0, 0], 1, 1));

    TrayIconBuilder::new()
        .icon(icon)
        .on_tray_icon_event(move |tray, event| {
            if let TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            }
            | TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Right,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            }
            | TrayIconEvent::DoubleClick { .. } = event
            {
                let app_handle = tray.app_handle().clone();
                tauri::async_runtime::spawn(async move {
                    let (x, y) = if let Ok(Some(monitor)) = app_handle.primary_monitor() {
                        let size = monitor.size();
                        let pos = monitor.position();
                        (
                            (pos.x + size.width as i32) as f64 - 280.0,
                            (pos.y + size.height as i32) as f64 - 620.0,
                        )
                    } else {
                        (100.0, 100.0)
                    };
                    let _ =
                        crate::commands::window::show_menu_window(app_handle, x, y, Some(0))
                            .await;
                });
            }
        })
        .build(app)
}

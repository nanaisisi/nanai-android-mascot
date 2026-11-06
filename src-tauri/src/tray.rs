use tauri::image::Image;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};

#[cfg(desktop)]
pub fn setup_tray(app: &tauri::App) -> Result<TrayIcon<tauri::Wry>, tauri::Error> {
    let icon = match image::load_from_memory(include_bytes!("../icons/32x32.png")) {
        Ok(img) => {
            let rgba = img.to_rgba8();
            let (width, height) = rgba.dimensions();
            Image::new_owned(rgba.into_raw(), width, height)
        }
        Err(_) => Image::new_owned(vec![255, 0, 0, 255], 1, 1),
    };

    let menu = Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, "show_menu", "メニューを表示", true, None::<&str>)?,
            &MenuItem::with_id(app, "quit", "終了", true, None::<&str>)?,
        ],
    )?;

    TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app_handle, event| {
            match event.id.as_ref() {
                "show_menu" => {
                    let app_handle = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        let _ = crate::commands::window::show_menu_window(
                            app_handle, 100.0, 100.0, Some(0),
                        )
                        .await;
                    });
                }
                "quit" => {
                    app_handle.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(move |tray, event| {
            if let TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
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
                        crate::commands::window::show_menu_window(app_handle, x, y, Some(0)).await;
                });
            }
        })
        .build(app)
}

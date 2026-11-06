use tauri::image::Image;
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};

#[cfg(desktop)]
pub fn setup_tray(app: &tauri::App) -> Result<TrayIcon<tauri::Wry>, tauri::Error> {
    println!("🟢 setup_tray 開始...");
    let icon = match image::load_from_memory(include_bytes!("../icons/32x32.png")) {
        Ok(img) => {
            let rgba = img.to_rgba8();
            let (width, height) = rgba.dimensions();
            println!("🟢 トレイアイコン画像読み込み成功: {}x{}", width, height);
            Image::new_owned(rgba.into_raw(), width, height)
        }
        Err(e) => {
            eprintln!("⚠️ トレイアイコン画像読み込み失敗 ({:?})、フォールバック使用", e);
            app.default_window_icon()
                .cloned()
                .unwrap_or_else(|| Image::new_owned(vec![255, 0, 0, 255], 32, 32))
        }
    };

    let tray = TrayIconBuilder::new()
        .icon(icon)
        .tooltip("Nanai Android Mascot")
        .show_menu_on_left_click(false)
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
                println!("🖱️ システムトレイアイコンがクリックされました");
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
        .build(app)?;

    println!("🟢 setup_tray 完了（トレイ登録成功）");
    Ok(tray)
}

#[cfg(not(desktop))]
pub fn setup_tray(_app: &tauri::App) -> Result<(), ()> {
    Ok(())
}

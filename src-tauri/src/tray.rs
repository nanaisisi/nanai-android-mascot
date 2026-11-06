use tauri::image::Image;
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::Manager;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use crate::common::state::AppState;

fn log_tray(msg: &str) {
    std::println!("{}", msg);
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open("nanai_tray_debug.log") {
        let _ = writeln!(f, "[{}] {}", chrono::Local::now().format("%H:%M:%S"), msg);
    }
}

#[cfg(not(target_os = "android"))]
pub fn setup_tray(app: &tauri::App) -> Result<TrayIcon<tauri::Wry>, tauri::Error> {
    log_tray("🟢 setup_tray 開始...");

    let icon = app
        .default_window_icon()
        .cloned()
        .unwrap_or_else(|| {
            log_tray("⚠️ default_window_icon が取得できなかったため、32x32赤色フォールバックを使用します");
            Image::new_owned(vec![255u8; 32 * 32 * 4], 32, 32)
        });

    let tray = TrayIconBuilder::with_id("main-tray")
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
                log_tray("🖱️ システムトレイアイコンがクリックされました");
                let app_handle = tray.app_handle().clone();
                tauri::async_runtime::spawn(async move {
                    let (x, y) = if let Ok(Some(monitor)) = app_handle.primary_monitor() {
                        let size = monitor.size();
                        let pos = monitor.position();
                        let win_width = 260.0;
                        let win_height = 720.0;
                        let target_x = (pos.x + size.width as i32) as f64 - win_width - 16.0;
                        let target_y = (pos.y + size.height as i32) as f64 - win_height - 48.0;
                        (target_x.max(pos.x as f64), target_y.max(pos.y as f64))
                    } else {
                        (100.0, 100.0)
                    };
                    let _ =
                        crate::commands::window::show_menu_window(app_handle, x, y, Some(0)).await;
                });
            }
        })
        .build(app);

    match &tray {
        Ok(_) => log_tray("🟢 setup_tray 完了（トレイ登録成功）"),
        Err(e) => log_tray(&format!("❌ エラー: トレイ登録失敗: {:?}", e)),
    }

    tray
}

#[cfg(not(target_os = "android"))]
pub fn update_tray_icon_from_path(app_handle: &tauri::AppHandle, icon_path: &Path) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let tray_lock = state.tray_icon.lock();
    if let Some(tray) = &*tray_lock {
        if icon_path.exists() {
            let bytes = std::fs::read(icon_path).map_err(|e| e.to_string())?;
            if let Ok(img) = image::load_from_memory(&bytes) {
                let rgba = img.to_rgba8();
                let (width, height) = rgba.dimensions();
                let icon = Image::new_owned(rgba.into_raw(), width, height);
                tray.set_icon(Some(icon)).map_err(|e| e.to_string())?;
                log_tray(&format!("🟢 トレイアイコンをゴースト固有の画像に差し替えました: {:?}", icon_path));
            }
        }
    }
    Ok(())
}

#[cfg(target_os = "android")]
pub fn setup_tray(_app: &tauri::App) -> Result<(), ()> {
    Ok(())
}

#[cfg(target_os = "android")]
pub fn update_tray_icon_from_path(_app_handle: &tauri::AppHandle, _icon_path: &Path) -> Result<(), String> {
    Ok(())
}

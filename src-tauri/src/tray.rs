use crate::common::state::AppState;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use tauri::Manager;
use tauri::image::Image;
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};

fn log_tray(msg: &str) {
    std::println!("{}", msg);
    if let Ok(mut f) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("nanai_tray_debug.log")
    {
        let _ = writeln!(f, "[{}] {}", chrono::Local::now().format("%H:%M:%S"), msg);
    }
}

#[cfg(not(target_os = "android"))]
pub fn setup_tray(app: &tauri::App) -> Result<TrayIcon<tauri::Wry>, tauri::Error> {
    log_tray("🟢 setup_tray 開始...");

    let icon = app.default_window_icon().cloned().unwrap_or_else(|| {
        log_tray(
            "⚠️ default_window_icon が取得できなかったため、32x32赤色フォールバックを使用します",
        );
        Image::new_owned(vec![255u8; 32 * 32 * 4], 32, 32)
    });

    let tray = TrayIconBuilder::with_id("main-tray")
        .icon(icon)
        .tooltip("Nanai Android Mascot")
        .show_menu_on_left_click(false)
        .on_tray_icon_event(move |tray, event| {
            if let TrayIconEvent::Click { rect, .. } | TrayIconEvent::DoubleClick { rect, .. } =
                event
            {
                log_tray("🖱️ システムトレイアイコンがクリックされました");
                let app_handle = tray.app_handle().clone();
                let r = rect;
                tauri::async_runtime::spawn(async move {
                    let px = match r.position {
                        tauri::Position::Physical(p) => p.x as f64,
                        tauri::Position::Logical(l) => l.x,
                    };
                    let py = match r.position {
                        tauri::Position::Physical(p) => p.y as f64,
                        tauri::Position::Logical(l) => l.y,
                    };
                    let ph = match r.size {
                        tauri::Size::Physical(s) => s.height as f64,
                        tauri::Size::Logical(s) => s.height,
                    };
                    // システムトレイアイコンの左下を起点とする (Left: px, Bottom: py + ph)
                    let x = px;
                    let y = py + ph;
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
pub fn update_tray_for_ghost(
    app_handle: &tauri::AppHandle,
    ghost_name: &str,
    ghost_master_dir: &Path,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let tray_lock = state.tray_icon.lock();
    if let Some(tray) = &*tray_lock {
        let tooltip_text = format!("Nanai Mascot - {}", ghost_name);
        let _ = tray.set_tooltip(Some(&tooltip_text));

        let descript_path = ghost_master_dir.join("descript.txt");
        let descript_map = crate::ghost::scan::read_descript_file(&descript_path);
        let custom_icon_path = descript_map
            .as_ref()
            .and_then(|m| m.get("icon.minimize").or_else(|| m.get("icon")))
            .map(|val| ghost_master_dir.join(val));

        let icon_min_ico = ghost_master_dir.join("icon_minimize.ico");
        let icon_min_png = ghost_master_dir.join("icon_minimize.png");
        let tray_ico = ghost_master_dir.join("tray.ico");
        let tray_png = ghost_master_dir.join("tray.png");

        let tray_path = if let Some(ref p) = custom_icon_path {
            if p.exists() { Some(p.clone()) } else { None }
        } else if icon_min_ico.exists() {
            Some(icon_min_ico)
        } else if icon_min_png.exists() {
            Some(icon_min_png)
        } else if tray_ico.exists() {
            Some(tray_ico)
        } else if tray_png.exists() {
            Some(tray_png)
        } else {
            None
        };

        if let Some(icon_path) = tray_path {
            if let Ok(bytes) = std::fs::read(&icon_path)
                && let Ok(img) = image::load_from_memory(&bytes)
            {
                let rgba = img.to_rgba8();
                let (width, height) = rgba.dimensions();
                let icon = Image::new_owned(rgba.into_raw(), width, height);
                let _ = tray.set_icon(Some(icon));
                log_tray(&format!(
                    "🟢 トレイアイコン & ツールチップ更新 (icon.minimize.md 準拠): ghost={}, icon={:?}",
                    ghost_name, icon_path
                ));
            }
        } else {
            log_tray(&format!("🟢 トレイツールチップ更新: ghost={}", ghost_name));
        }
    }
    Ok(())
}

#[cfg(not(target_os = "android"))]
pub fn reset_tray_to_default(app_handle: &tauri::AppHandle) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let tray_lock = state.tray_icon.lock();
    if let Some(tray) = &*tray_lock {
        let _ = tray.set_tooltip(Some("Nanai Android Mascot"));
        if let Some(icon) = app_handle.default_window_icon() {
            let _ = tray.set_icon(Some(icon.clone()));
        }
        log_tray("🟢 トレイアイコン & ツールチップをデフォルトに復元しました");
    }
    Ok(())
}

#[allow(dead_code)]
#[cfg(not(target_os = "android"))]
pub fn update_tray_icon_from_path(
    app_handle: &tauri::AppHandle,
    icon_path: &Path,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let tray_lock = state.tray_icon.lock();
    if let Some(tray) = &*tray_lock
        && icon_path.exists()
    {
        let bytes = std::fs::read(icon_path).map_err(|e| e.to_string())?;
        if let Ok(img) = image::load_from_memory(&bytes) {
            let rgba = img.to_rgba8();
            let (width, height) = rgba.dimensions();
            let icon = Image::new_owned(rgba.into_raw(), width, height);
            tray.set_icon(Some(icon)).map_err(|e| e.to_string())?;
            log_tray(&format!(
                "🟢 トレイアイコンをゴースト固有の画像に差し替えました: {:?}",
                icon_path
            ));
        }
    }
    Ok(())
}

#[cfg(target_os = "android")]
pub fn setup_tray(_app: &tauri::App) -> Result<(), ()> {
    Ok(())
}

#[cfg(target_os = "android")]
pub fn update_tray_for_ghost(
    _app_handle: &tauri::AppHandle,
    _ghost_name: &str,
    _ghost_master_dir: &Path,
) -> Result<(), String> {
    Ok(())
}

#[cfg(target_os = "android")]
pub fn reset_tray_to_default(_app_handle: &tauri::AppHandle) -> Result<(), String> {
    Ok(())
}

#[cfg(target_os = "android")]
pub fn update_tray_icon_from_path(
    _app_handle: &tauri::AppHandle,
    _icon_path: &Path,
) -> Result<(), String> {
    Ok(())
}

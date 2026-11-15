//! トレイアイコンおよびツールチップ動的更新処理

use super::logging::log_tray;
use std::path::Path;

#[cfg(not(target_os = "android"))]
use crate::common::state::AppState;
#[cfg(not(target_os = "android"))]
use tauri::Manager;
#[cfg(not(target_os = "android"))]
use tauri::image::Image;

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

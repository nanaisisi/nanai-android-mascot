use super::{open_text_file, resolve_ghost_directory};
use crate::common::models::GhostInfo;
use crate::ghost::scan::assets::discover_ghost_assets;
use crate::ghost::scan::directory::manifest::parse_ghost_manifest;
use crate::ghost::scan::directory::package_files::{
    find_ghost_readme, find_ghost_terms, find_ghost_thumbnail,
};
use crate::ghost::scan::shell::scan_shells_from_ghost;
use std::path::{Path, PathBuf};

pub fn resolve_ghost_dir_opt(ghost_name: &str, app_handle: &tauri::AppHandle) -> Option<PathBuf> {
    resolve_ghost_directory(ghost_name, app_handle).ok()
}

#[tauri::command]
pub async fn get_ghost_info(
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<GhostInfo, String> {
    let dir = resolve_ghost_dir_opt(&ghost_name, &app_handle)
        .ok_or_else(|| format!("Ghost not found: {}", ghost_name))?;

    let manifest = parse_ghost_manifest(&dir, &ghost_name);
    let shells = scan_shells_from_ghost(&dir);

    // 省略されているプロパティはデフォルト値かNoneを入れる
    Ok(GhostInfo {
        assets: Default::default(),
        name: manifest.display_name().to_string(),
        version: manifest.version().map(ToString::to_string),
        path: dir.to_string_lossy().to_string(),
        sakura_name: manifest.sakura_name().map(ToString::to_string),
        kero_name: manifest.kero_name().map(ToString::to_string),
        num_characters: manifest.num_characters(),
        shiori: manifest.shiori().map(ToString::to_string),
        makoto: manifest.makoto().map(ToString::to_string),
        craftman: manifest.craftman().map(ToString::to_string),
        craftman_url: manifest.craftman_url().map(ToString::to_string),
        shells,
        group: manifest.group().map(ToString::to_string),
        install_date: None,
        update_date: None,
        update_result: None,
        recommended_balloon: manifest.recommended_balloon().map(ToString::to_string),
        recommended_balloon_path: manifest.recommended_balloon_path().map(ToString::to_string),
        default_balloon_path: manifest.default_balloon_path().map(ToString::to_string),
        balloon_defaultsurface: manifest.balloon_defaultsurface(),
        sakura_balloon_defaultsurface: manifest.sakura_balloon_defaultsurface(),
        kero_balloon_defaultsurface: manifest.kero_balloon_defaultsurface(),
        char_balloon_defaultsurfaces: manifest.char_balloon_defaultsurfaces().clone(),
        shiori_version: manifest.shiori_version().map(ToString::to_string),
        shiori_cache: manifest.shiori_cache().map(ToString::to_string),
        shiori_encoding: manifest.shiori_encoding().map(ToString::to_string),
        shiori_forceencoding: manifest.shiori_forceencoding().map(ToString::to_string),
        shiori_escape_unknown: manifest.shiori_escape_unknown().map(ToString::to_string),
        shiori_logo_file: manifest.shiori_logo_file().map(ToString::to_string),
        shiori_logo_align: manifest.shiori_logo_align().map(ToString::to_string),
        shiori_logo_x: manifest.shiori_logo_x(),
        shiori_logo_y: manifest.shiori_logo_y(),
    })
}

#[tauri::command]
pub async fn uninstall_ghost(
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<bool, String> {
    use tauri::Manager;
    use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

    let state = app_handle.state::<crate::common::AppState>();
    *state.is_dialog_open.lock() = true;

    let confirmed = tauri::async_runtime::spawn_blocking({
        let app = app_handle.clone();
        let name = ghost_name.clone();
        move || {
            app.dialog()
                .message(format!(
                    "ゴースト「{name}」をアンインストールしますか？\nゴーストのファイルはすべて削除されます（復元できません）。"
                ))
                .title("アンインストール確認")
                .kind(MessageDialogKind::Warning)
                .buttons(MessageDialogButtons::OkCancel)
                .blocking_show()
        }
    })
    .await
    .unwrap_or(false);
    *app_handle
        .state::<crate::common::AppState>()
        .is_dialog_open
        .lock() = false;

    if !confirmed {
        return Ok(false);
    }

    let Some(dir) = resolve_ghost_dir_opt(&ghost_name, &app_handle) else {
        return Ok(false);
    };
    std::fs::remove_dir_all(&dir)
        .map(|_| true)
        .map_err(|e| format!("ゴーストの削除に失敗しました: {e}"))
}

pub fn read_ghost_readme_from_dir(dir: &Path) -> Option<String> {
    let path = find_ghost_readme(dir)?;
    open_text_file(&path).ok()
}

pub fn read_ghost_terms_from_dir(dir: &Path) -> Option<String> {
    let path = find_ghost_terms(dir)?;
    open_text_file(&path).ok()
}

pub fn resolve_ghost_thumbnail_from_dir(dir: &Path) -> Option<String> {
    find_ghost_thumbnail(dir)
        .map(|p| p.to_string_lossy().to_string())
        .or_else(|| discover_ghost_assets(dir).thumbnail)
}

#[tauri::command]
pub async fn get_ghost_readme(
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = resolve_ghost_dir_opt(&ghost_name, &app_handle)
        .ok_or_else(|| format!("Ghost not found: {ghost_name}"))?;
    Ok(read_ghost_readme_from_dir(&dir))
}

#[tauri::command]
pub async fn get_ghost_terms(
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = resolve_ghost_dir_opt(&ghost_name, &app_handle)
        .ok_or_else(|| format!("Ghost not found: {ghost_name}"))?;
    Ok(read_ghost_terms_from_dir(&dir))
}

#[tauri::command]
pub async fn get_ghost_thumbnail(
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = resolve_ghost_dir_opt(&ghost_name, &app_handle)
        .ok_or_else(|| format!("Ghost not found: {ghost_name}"))?;
    Ok(resolve_ghost_thumbnail_from_dir(&dir))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_readme_terms_and_thumbnail_from_ghost_dir() {
        let dir = std::env::temp_dir().join(format!("nam_ghost_cmd_{}", std::process::id()));
        let master = dir.join("ghost").join("master");
        std::fs::create_dir_all(&master).unwrap();

        assert_eq!(read_ghost_readme_from_dir(&dir), None);
        assert_eq!(read_ghost_terms_from_dir(&dir), None);
        assert_eq!(resolve_ghost_thumbnail_from_dir(&dir), None);

        std::fs::write(dir.join("readme.txt"), "hello readme").unwrap();
        std::fs::write(dir.join("terms.md"), "hello terms").unwrap();
        std::fs::write(master.join("thumbnail.png"), b"png").unwrap();

        assert_eq!(
            read_ghost_readme_from_dir(&dir).as_deref(),
            Some("hello readme")
        );
        assert_eq!(
            read_ghost_terms_from_dir(&dir).as_deref(),
            Some("hello terms")
        );
        assert!(
            resolve_ghost_thumbnail_from_dir(&dir).is_some_and(|p| p.ends_with("thumbnail.png"))
        );

        // ルート直下の thumbnail.pnr が ghost/master/ より優先される
        std::fs::write(dir.join("thumbnail.pnr"), b"pnr").unwrap();
        assert!(
            resolve_ghost_thumbnail_from_dir(&dir).is_some_and(|p| p.ends_with("thumbnail.pnr"))
        );

        std::fs::remove_dir_all(&dir).ok();
    }
}

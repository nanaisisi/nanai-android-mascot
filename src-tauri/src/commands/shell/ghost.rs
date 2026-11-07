use crate::common::paths::resolve_ghost_directory;
use crate::common::models::GhostInfo;
use crate::ghost::scan::directory::manifest::parse_ghost_manifest;
use crate::ghost::scan::shell::scan_shells_from_ghost;
use std::path::PathBuf;

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
        name: manifest.display_name,
        version: manifest.version,
        path: dir.to_string_lossy().to_string(),
        sakura_name: manifest.sakura_name,
        kero_name: manifest.kero_name,
        num_characters: manifest.num_characters,
        shiori: manifest.shiori,
        craftman: manifest.craftman,
        craftman_url: manifest.craftman_url,
        shells,
        group: manifest.group,
        install_date: None,
        update_date: None,
        update_result: None,
        recommended_balloon: manifest.recommended_balloon,
        recommended_balloon_path: manifest.recommended_balloon_path,
        default_balloon_path: manifest.default_balloon_path,
        balloon_defaultsurface: manifest.balloon_defaultsurface,
        sakura_balloon_defaultsurface: manifest.sakura_balloon_defaultsurface,
        kero_balloon_defaultsurface: manifest.kero_balloon_defaultsurface,
        char_balloon_defaultsurfaces: manifest.char_balloon_defaultsurfaces,
        shiori_version: manifest.shiori_version,
        shiori_cache: manifest.shiori_cache,
        shiori_encoding: manifest.shiori_encoding,
        shiori_forceencoding: manifest.shiori_forceencoding,
        shiori_escape_unknown: manifest.shiori_escape_unknown,
        shiori_logo_file: manifest.shiori_logo_file,
        shiori_logo_align: manifest.shiori_logo_align,
        shiori_logo_x: manifest.shiori_logo_x,
        shiori_logo_y: manifest.shiori_logo_y,
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

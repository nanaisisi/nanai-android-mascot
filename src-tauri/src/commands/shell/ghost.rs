use crate::common::*;
use std::path::PathBuf;

pub fn resolve_ghost_dir_opt(ghost_name: &str, app_handle: &tauri::AppHandle) -> Option<PathBuf> {
    resolve_ghost_directory(ghost_name, app_handle).ok()
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
    *app_handle.state::<crate::common::AppState>().is_dialog_open.lock() = false;

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

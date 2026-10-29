pub mod archive;
pub mod utils;

use crate::common::*;
use std::path::Path;
use tauri::Manager;

pub use archive::extract_ghost_archive_from_reader;

/// ネイティブのファイル選択ダイアログを開き、選んだアーカイブを取り込む。キャンセル時は None
#[tauri::command]
pub async fn pick_and_install_ghost_archive(
    app_handle: tauri::AppHandle,
) -> Result<Option<GhostInfo>, String> {
    use tauri_plugin_dialog::DialogExt;
    let state = app_handle.state::<crate::common::AppState>();
    *state.is_dialog_open.lock() = true;

    let picked = tauri::async_runtime::spawn_blocking({
        let app = app_handle.clone();
        move || {
            app.dialog()
                .file()
                .add_filter("Ghost archive", &["nar", "zip"])
                .blocking_pick_file()
        }
    })
    .await
    .map_err(|e| e.to_string())?;

    let state2 = app_handle.state::<crate::common::AppState>();
    *state2.is_dialog_open.lock() = false;

    let Some(fp) = picked else { return Ok(None) };
    let path = fp.into_path().map_err(|e| e.to_string())?;
    install_ghost_archive(path.to_string_lossy().to_string(), app_handle)
        .await
        .map(Some)
}

/// ゴーストアーカイブ (.nar / .zip) のパス指定取り込み・解凍コマンド
#[tauri::command]
pub async fn install_ghost_archive(
    archive_path: String,
    app_handle: tauri::AppHandle,
) -> Result<GhostInfo, String> {
    println!("📦 Installing ghost archive from path: {}", archive_path);
    let clean = clean_verbatim_path(&archive_path);
    let file = std::fs::File::open(&clean)
        .map_err(|e| format!("Failed to open archive '{}': {}", clean, e))?;

    let zip = zip::ZipArchive::new(file).map_err(|e| format!("Invalid zip/nar archive: {}", e))?;

    let p = Path::new(&clean);
    let fallback = p
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "imported_ghost".to_string());

    extract_ghost_archive_from_reader(zip, &fallback, &app_handle)
}

/// ゴーストアーカイブ (.nar / .zip) のバイナリ直接取り込み・解凍コマンド
#[tauri::command]
pub async fn install_ghost_archive_bytes(
    file_name: String,
    bytes: Vec<u8>,
    app_handle: tauri::AppHandle,
) -> Result<GhostInfo, String> {
    println!(
        "📦 Installing ghost archive from memory bytes: {} ({} bytes)",
        file_name,
        bytes.len()
    );
    let reader = std::io::Cursor::new(bytes);
    let zip =
        zip::ZipArchive::new(reader).map_err(|e| format!("Invalid zip/nar archive: {}", e))?;

    let p = Path::new(&file_name);
    let fallback = p
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "imported_ghost".to_string());

    extract_ghost_archive_from_reader(zip, &fallback, &app_handle)
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_install_module() {
        // Module availability verification
    }
}

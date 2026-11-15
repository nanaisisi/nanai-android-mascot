//! 一般ファイルオープン、最近開いたファイル履歴管理、ゴーストフォルダオープンコマンド

use super::helpers::find_file_case_insensitive;
use crate::common::paths::{clean_verbatim_path, resolve_asset_path};
use crate::common::state::AppState;
use nanai_vfs::open_shift_jis_file;
use std::path::PathBuf;
use tauri::Manager;

// ファイルを開くコマンド
#[tauri::command]
pub fn open_file(path: String, app_handle: tauri::AppHandle<tauri::Wry>) -> Result<String, String> {
    let clean_path = clean_verbatim_path(&path);
    let resolved_path =
        resolve_asset_path(&clean_path, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_path));

    let final_path = find_file_case_insensitive(&resolved_path).unwrap_or(resolved_path);

    match open_shift_jis_file(&final_path.to_string_lossy()) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("ファイルの読み込みに失敗しました: {e}")),
    }
}

// 最近開いたファイル履歴を管理するための関数
#[tauri::command]
pub fn add_to_recent_files(
    path: String,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<(), String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let mut recent_files = app_state.recent_files.lock();

    if let Some(index) = recent_files.iter().position(|x| *x == path) {
        recent_files.remove(index);
    }

    recent_files.insert(0, path);

    if recent_files.len() > 10 {
        recent_files.truncate(10);
    }

    Ok(())
}

#[tauri::command]
pub fn get_recent_files(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<Vec<String>, String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let recent_files = app_state.recent_files.lock();
    Ok(recent_files.clone())
}

#[tauri::command]
pub fn open_ghost_directory(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<(), String> {
    let base = resolve_asset_path("assets/ghost", &app_handle)
        .unwrap_or_else(|_| PathBuf::from("assets/ghost"));

    tauri_plugin_opener::reveal_item_in_dir(base)
        .map_err(|e| format!("Failed to open directory: {}", e))
}

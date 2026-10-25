#![allow(unused_imports)]
use crate::common::*;
use nanai_android_mascot_ui::{open_shift_jis_file, resolve_vfs_path};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};
// ファイルを開くコマンド
#[tauri::command]
pub fn open_file(path: String, app_handle: tauri::AppHandle<tauri::Wry>) -> Result<String, String> {
    let clean_path = clean_verbatim_path(&path);
    let resolved_path =
        resolve_asset_path(&clean_path, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_path));

    match open_shift_jis_file(&resolved_path.to_string_lossy()) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("ファイルの読み込みに失敗しました: {e}")),
    }
}

// サーフィス画像を読み込んでData URL (Base64) として返すコマンド
#[tauri::command]
pub fn load_surface_image(
    ghost_path: String,
    shell_name: String,
    surface_id: String,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<String, String> {
    use std::fs;
    let clean_gp = clean_verbatim_path(&ghost_path);
    let base_ghost_path =
        resolve_asset_path(&clean_gp, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_gp));

    let shell_dir = base_ghost_path.join("shell").join(&shell_name);
    let master_dir = base_ghost_path.join("shell").join("master");

    let surface_id_num = surface_id.parse::<u32>().unwrap_or(0);
    let mut candidates = vec![
        shell_dir.join(format!("surface{surface_id}.png")),
        shell_dir.join(format!("surface{surface_id_num:04}.png")),
        shell_dir.join(format!("surface{surface_id_num:02}.png")),
        shell_dir.join(format!("surface{surface_id}.svg")),
        shell_dir.join(format!("surface{surface_id}.pna")),
        shell_dir.join(format!("Surface{surface_id}.png")),
        shell_dir.join(format!("Surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{surface_id}.png")),
        master_dir.join(format!("surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{surface_id_num:02}.png")),
        master_dir.join(format!("surface{surface_id}.svg")),
    ];

    // surface_id が 0 または 10 の場合のみ、基本フォールバック (surface0.png / surface10.png) を候補末尾に追加
    if surface_id_num == 0 {
        candidates.push(shell_dir.join("surface0.png"));
        candidates.push(shell_dir.join("surface0000.png"));
        candidates.push(shell_dir.join("surface0.svg"));
        candidates.push(master_dir.join("surface0.png"));
        candidates.push(master_dir.join("surface0000.png"));
        candidates.push(master_dir.join("surface0.svg"));
    } else if surface_id_num == 10 {
        candidates.push(shell_dir.join("surface10.png"));
        candidates.push(shell_dir.join("surface0010.png"));
        candidates.push(shell_dir.join("surface10.svg"));
        candidates.push(master_dir.join("surface10.png"));
        candidates.push(master_dir.join("surface0010.png"));
        candidates.push(master_dir.join("surface10.svg"));
    }

    for candidate in candidates {
        if candidate.exists()
            && candidate.is_file()
            && let Ok(bytes) = fs::read(&candidate)
        {
            let ext = candidate
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png")
                .to_lowercase();
            let mime = match ext.as_str() {
                "svg" => "image/svg+xml",
                "pna" => "image/png",
                _ => "image/png",
            };
            use base64::Engine;
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Ok(format!("data:{mime};base64,{b64}"));
        }
    }

    Err(format!(
        "Surface image not found for surface_id: {surface_id} in shell: {shell_name}"
    ))
}

// 最近開いたファイル履歴を管理するための関数
#[tauri::command]
pub fn add_to_recent_files(
    path: String,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<(), String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let mut recent_files = match app_state.recent_files.lock() {
        Ok(lock) => lock,
        Err(e) => {
            let msg = e.to_string();
            eprintln!("add_to_recent_files lock error: {msg}");
            emit_error_to_all(&app_handle, msg.clone());
            return Err(msg);
        }
    };

    // 既に存在する場合は削除して先頭に追加（LRU方式）
    if let Some(index) = recent_files.iter().position(|x| *x == path) {
        recent_files.remove(index);
    }

    // 先頭に追加
    recent_files.insert(0, path);

    // 最大10件まで保持
    if recent_files.len() > 10 {
        recent_files.truncate(10);
    }

    Ok(())
}

#[tauri::command]
pub fn get_recent_files(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<Vec<String>, String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let recent_files = match app_state.recent_files.lock() {
        Ok(lock) => lock,
        Err(e) => {
            let msg = e.to_string();
            eprintln!("get_recent_files lock error: {msg}");
            emit_error_to_all(&app_handle, msg.clone());
            return Err(msg);
        }
    };
    Ok(recent_files.clone())
}

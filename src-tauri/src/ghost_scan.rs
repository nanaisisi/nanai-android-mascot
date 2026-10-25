#![allow(unused_imports)]
use crate::common::*;
use nanai_android_mascot_ui::{open_shift_jis_file, resolve_vfs_path};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};
// ========================================
// SHIORI関連のTauriコマンド
// ========================================

/// ゴーストスキャン結果
#[derive(Debug, Clone, serde::Serialize)]
pub struct ScanResult {
    ghosts: Vec<GhostInfo>,
    resolved_path: String,
    input_path: String,
}

/// descript.txt からゴースト正式名を取得（Shift_JIS / UTF-8 両対応）
pub fn read_ghost_name_from_dir(ghost_dir: &Path) -> Option<String> {
    let candidates = [
        ghost_dir.join("ghost").join("master").join("descript.txt"),
        ghost_dir.join("descript.txt"),
        ghost_dir.join("install.txt"),
    ];

    for candidate in &candidates {
        if candidate.exists()
            && let Ok(bytes) = std::fs::read(candidate)
        {
            // 1. UTF-8判定（明示的なcharset,UTF-8宣言、またはValid UTF-8かつShift_JIS特有エラーがない場合）
            let text = if let Ok(utf8_str) = std::str::from_utf8(&bytes) {
                // charset,Shift_JIS 指定が明記されていない限り、有効なUTF-8であればUTF-8を優先
                if utf8_str.to_lowercase().contains("charset,shift_jis")
                    || utf8_str.to_lowercase().contains("charset,sjis")
                {
                    let (sjis_decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
                    sjis_decoded.into_owned()
                } else {
                    utf8_str.to_string()
                }
            } else {
                let (sjis_decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
                sjis_decoded.into_owned()
            };

            for line in text.lines() {
                let trimmed = line.trim();
                if let Some(val) = trimmed.strip_prefix("name,") {
                    let cleaned = val.trim();
                    if !cleaned.is_empty() {
                        return Some(cleaned.to_string());
                    }
                } else if let Some(val) = trimmed.strip_prefix("name:") {
                    let cleaned = val.trim();
                    if !cleaned.is_empty() {
                        return Some(cleaned.to_string());
                    }
                }
            }
        }
    }
    None
}

/// ゴーストディレクトリをスキャンしてSHIORIを検出
#[tauri::command]
pub async fn scan_ghost_directory(
    _state: tauri::State<'_, AppState>,
    ghost_dir: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    // アプリのパスコンテキストを取得
    let ghost_path = resolve_asset_path(&ghost_dir, &app_handle)?;

    println!("🔍 Input path: {}", ghost_dir);
    println!("🔍 Resolved absolute path: {:?}", ghost_path);

    // ゴーストスキャン（ディレクトリ巡回）
    let mut ghosts = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&ghost_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let dir_name = entry.file_name().to_string_lossy().to_string();
                // .gitや隠しフォルダを除外
                if !dir_name.starts_with('.') {
                    // descript.txt から正式ゴースト名を取得（なければディレクトリ名）
                    let display_name = read_ghost_name_from_dir(&path).unwrap_or(dir_name);
                    ghosts.push(GhostInfo {
                        name: display_name,
                        path: path.to_string_lossy().to_string(),
                    });
                }
            }
        }
    }

    // fallback: ディレクトリ走査で見つからずmock_nanaiが存在する場合
    if ghosts.is_empty() {
        let mock_nanai_path = ghost_path.join("mock_nanai");
        if mock_nanai_path.exists() {
            ghosts.push(GhostInfo {
                name: "mock_nanai".to_string(),
                path: mock_nanai_path.to_string_lossy().to_string(),
            });
        }
    }

    let result = ScanResult {
        ghosts,
        resolved_path: ghost_path.to_string_lossy().to_string(),
        input_path: ghost_dir,
    };

    println!("📊 Scan completed: {} ghosts found", result.ghosts.len());

    Ok(result)
}

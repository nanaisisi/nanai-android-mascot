#![allow(non_snake_case)]
#![allow(unused)]

use std::fs;
use std::path::PathBuf;

/// ghostディレクトリのパスを取得
pub fn get_ghost_dir() -> PathBuf {
    // プロジェクトルート直下のghostディレクトリ
    PathBuf::from("ghost")
}

/// ghostディレクトリ直下のディレクトリ一覧を取得
pub fn get_ghost_dir_list() -> Vec<String> {
    let ghost_dir = get_ghost_dir();
    let mut list = Vec::new();
    if let Ok(entries) = fs::read_dir(&ghost_dir) {
        for entry in entries.flatten() {
            if entry.path().is_dir() {
                if let Some(name) = entry.file_name().to_str() {
                    list.push(name.to_string());
                }
            }
        }
    }
    list
}

// ファイル名のみを抽出する関数
pub fn extract_filename(path: &str) -> String {
    std::path::Path::new(path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(path)
        .to_string()
}

/*
// --- 未実装 / Dioxus UI関連コード（依存関係整理まで一時コメントアウト） ---
#[derive(Clone, Debug)]
struct FileContent {
    path: String,
    content: Option<String>,
    error: Option<String>,
}

#[derive(Clone, Debug, Default)]
struct AppState {
    files: Vec<FileContent>,
    current_file: Option<usize>,
    recent_files: Vec<String>,
}

#[derive(serde::Serialize, serde::Deserialize)]
struct OpenFileResult {
    content: Option<String>,
    error: Option<String>,
}
*/

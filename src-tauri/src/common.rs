#![allow(unused_imports)]
use crate::shiori::dynamic::ShioriDynamicEngine;
use nanai_android_mascot_ui::resolve_vfs_path;
use parking_lot::Mutex;
use std::fmt;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;
use tauri::{Emitter, Manager};

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum LogLevel {
    Off,
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

static LOG_LEVEL: OnceLock<LogLevel> = OnceLock::new();

pub fn initialize_logging_from_args() {
    let level = std::env::args()
        .find_map(|arg| {
            if arg == "--quiet" {
                return Some(LogLevel::Off);
            }
            arg.strip_prefix("--log-level=").and_then(parse_log_level)
        })
        .unwrap_or(LogLevel::Info);
    let _ = LOG_LEVEL.set(level);
}

fn parse_log_level(value: &str) -> Option<LogLevel> {
    match value.to_ascii_lowercase().as_str() {
        "off" | "none" => Some(LogLevel::Off),
        "error" => Some(LogLevel::Error),
        "warn" | "warning" => Some(LogLevel::Warn),
        "info" => Some(LogLevel::Info),
        "debug" => Some(LogLevel::Debug),
        "trace" => Some(LogLevel::Trace),
        _ => None,
    }
}

pub fn log_print(level: LogLevel, message: fmt::Arguments<'_>) {
    let configured = LOG_LEVEL.get().copied().unwrap_or(LogLevel::Info);
    if level <= configured && level != LogLevel::Off {
        std::eprintln!("{message}");
    }
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct ShellMenuTheme {
    pub background_color: Option<String>,
    pub foreground_color: Option<String>,
    pub font_color: Option<String>,
    pub background_font_color: Option<String>,
    pub foreground_font_color: Option<String>,
    pub disable_font_color: Option<String>,
    pub separator_color: Option<String>,
    pub background_bitmap: Option<String>,
    pub foreground_bitmap: Option<String>,
    pub sidebar_bitmap: Option<String>,
}

// シェル情報
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ShellInfo {
    pub name: String,
    pub path: String,
    pub display_name: Option<String>,
    pub menu_theme: Option<ShellMenuTheme>,
}

// フル規格対応ゴースト情報
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct GhostInfo {
    pub name: String,
    pub path: String,
    pub sakura_name: Option<String>,
    pub kero_name: Option<String>,
    pub shiori: Option<String>,
    pub craftman: Option<String>,
    pub craftman_url: Option<String>,
    pub shells: Vec<ShellInfo>,
}

// アプリケーション状態を定義
pub struct AppState {
    pub recent_files: Mutex<Vec<String>>,
    pub current_ghost_name: Mutex<Option<String>>,
    pub shiori_engine: Mutex<Option<ShioriDynamicEngine>>,
    // マルチゴースト対応 (ghost_id -> Engine, ghost_id -> ghost_name)
    pub ghost_engines: Mutex<std::collections::HashMap<String, ShioriDynamicEngine>>,
    pub active_ghosts: Mutex<std::collections::HashMap<String, String>>,
    pub is_dialog_open: Mutex<bool>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            recent_files: Mutex::new(Vec::new()),
            current_ghost_name: Mutex::new(None),
            shiori_engine: Mutex::new(None),
            ghost_engines: Mutex::new(std::collections::HashMap::new()),
            active_ghosts: Mutex::new(std::collections::HashMap::new()),
            is_dialog_open: Mutex::new(false),
        }
    }
}

/// アセットパスを解決（開発/本番環境対応）
pub fn resolve_asset_path(
    relative_path: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    let clean = clean_verbatim_path(relative_path);
    let path = PathBuf::from(&clean);

    if path.is_absolute() {
        if path.exists() {
            return Ok(normalize_path(&path));
        }
        return Ok(path);
    }

    // 複数のパス候補を試す
    let path_candidates = vec![
        // 1. 開発モード: プロジェクトルート/assets/...
        {
            let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
            let project_root = current_dir
                .ancestors()
                .find(|p| p.join("assets").exists())
                .or_else(|| {
                    current_dir.ancestors().find(|p| {
                        p.join("Cargo.toml").exists()
                            && p.file_name().is_none_or(|n| n != "src-tauri")
                    })
                })
                .unwrap_or(&current_dir);
            project_root.join(&path)
        },
        // 2. 本番モード: リソースディレクトリ
        app_handle
            .path()
            .resource_dir()
            .map(|resource_dir| resource_dir.join(&path))
            .unwrap_or_else(|_| PathBuf::from(&path)),
        // 3. 実行ファイル隣接
        app_handle
            .path()
            .app_data_dir()
            .map(|app_dir| app_dir.join(&path))
            .unwrap_or_else(|_| PathBuf::from(&path)),
        // 4. カレントディレクトリからの相対パス
        std::env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(&path),
    ];

    // 存在するパスを見つける (直接またはVFS大文字小文字吸収)
    for candidate in &path_candidates {
        println!("🔍 Checking path candidate: {:?}", candidate);
        if candidate.exists() {
            let normalized = normalize_path(candidate);
            println!("✅ Found valid path: {:?}", candidate);
            return Ok(normalized);
        }

        // 大文字・小文字差異の解決を試行
        if let Some(parent) = candidate.parent()
            && parent.exists()
            && let Some(file_name) = candidate.file_name().and_then(|n| n.to_str())
            && let Some(resolved) = resolve_vfs_path(parent, file_name)
        {
            let normalized = normalize_path(&resolved);
            println!("✅ Found path via VFS (case-insensitive): {:?}", resolved);
            return Ok(normalized);
        }
    }

    // 見つからない場合は最初の候補を返す（デバッグ用）
    let fallback = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join(&path);

    println!("⚠️ No valid path found, using fallback: {:?}", fallback);
    Ok(normalize_path(&fallback))
}

/// 表示名とフォルダ名が異なるゴーストの実ディレクトリを解決する。
pub fn resolve_ghost_directory(
    ghost_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    let direct_candidates = [
        format!("assets/ghost/{ghost_name}"),
        format!("ghost/{ghost_name}"),
    ];
    for candidate in direct_candidates {
        let resolved = resolve_asset_path(&candidate, app_handle)?;
        if resolved.is_dir() {
            return Ok(resolved);
        }
    }

    let roots = ["assets/ghost", "ghost"];
    for root in roots {
        let resolved_root = resolve_asset_path(root, app_handle)?;
        let Ok(entries) = std::fs::read_dir(&resolved_root) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }
            let folder_name = entry.file_name().to_string_lossy().to_string();
            if folder_name == ghost_name {
                return Ok(path);
            }
            let descriptors = [
                path.join("ghost").join("master").join("descript.txt"),
                path.join("descript.txt"),
                path.join("install.txt"),
            ];
            if descriptors
                .iter()
                .filter_map(|p| crate::ghost::scan::read_descript_file(p))
                .any(|meta| meta.get("name").is_some_and(|name| name == ghost_name))
            {
                return Ok(path);
            }
        }
    }

    Err(format!("Ghost directory not found: {ghost_name}"))
}

/// Windows の拡張プレフィックス (\\?\) を除去し、スラッシュを正規化
pub fn clean_verbatim_path(path_str: &str) -> String {
    let mut s = path_str.to_string();
    if let Some(stripped) = s.strip_prefix(r"\\?\") {
        s = stripped.to_string();
    }
    s.replace('/', std::path::MAIN_SEPARATOR_STR)
}

/// パスを正規化（../などを解決）
pub fn normalize_path(path: &Path) -> PathBuf {
    let canonical = if let Ok(canonical) = path.canonicalize() {
        canonical
    } else {
        // canonicalize()が失敗した場合は手動でパスを正規化
        let mut components = Vec::new();
        for component in path.components() {
            match component {
                std::path::Component::ParentDir => {
                    components.pop();
                }
                std::path::Component::CurDir => {
                    // "."は無視
                }
                _ => {
                    components.push(component);
                }
            }
        }
        components.iter().collect()
    };

    // Windows環境で \\?\ プレフィックスが付いていたら除去して通常のパスにする
    let path_str = canonical.to_string_lossy();
    if let Some(stripped) = path_str.strip_prefix(r"\\?\") {
        PathBuf::from(stripped)
    } else {
        canonical
    }
}

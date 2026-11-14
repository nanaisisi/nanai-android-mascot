//! ネットワーク更新パス解決・検証・進捗報告ヘルパーモジュール

use std::path::{Component, Path, PathBuf};
use tauri::Emitter;

pub(super) fn resolve_update_ghost_dir(
    ghost_name: &str,
    ghost_path: Option<&str>,
    app_handle: &tauri::AppHandle,
) -> PathBuf {
    if let Some(path) = ghost_path.map(str::trim).filter(|path| !path.is_empty()) {
        let candidate = PathBuf::from(path);
        if candidate.is_dir() {
            return candidate;
        }
    }

    let candidates = [
        format!("assets/ghost/{}", ghost_name),
        format!("ghost/{}", ghost_name),
    ];
    for relative in candidates {
        if let Ok(resolved) = crate::commands::update::resolve_asset_path(&relative, app_handle)
            && resolved.is_dir()
        {
            return resolved;
        }
    }

    PathBuf::from(format!("assets/ghost/{}", ghost_name))
}

pub(super) fn validate_update_path(path: &str) -> Result<(), String> {
    let normalized = path.replace('\\', "/");
    if normalized.is_empty() || normalized.starts_with('/') {
        return Err(format!("更新ファイルのパスが不正です: {}", path));
    }
    let parsed = Path::new(&normalized);
    if parsed.components().any(|component| {
        matches!(
            component,
            Component::ParentDir | Component::RootDir | Component::Prefix(_)
        )
    }) {
        return Err(format!("更新ファイルのパスが不正です: {}", path));
    }
    Ok(())
}

pub struct ReportProgressParams<'a> {
    pub phase: &'a str,
    pub path: &'a str,
    pub detail: Option<&'a str>,
}

/// 1ファイルごとの更新進捗をフロントエンドへ通知
/// (フロント側で OnUpdate.OnDownloadBegin / OnUpdate.OnMD5Compare* として SHIORI に中継する)
pub(super) fn report_progress(
    app_handle: &tauri::AppHandle,
    params: ReportProgressParams<'_>,
) {
    let ReportProgressParams { phase, path, detail } = params;
    let payload = serde_json::json!({ "phase": phase, "path": path, "detail": detail });
    let _ = app_handle.emit("update-progress", payload);
}

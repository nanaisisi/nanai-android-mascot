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

pub(super) fn resolve_update_asset_dir(
    kind: &str,
    name: &str,
    explicit_path: Option<&str>,
    app_handle: &tauri::AppHandle,
) -> PathBuf {
    if let Some(path) = explicit_path.map(str::trim).filter(|path| !path.is_empty()) {
        let candidate = PathBuf::from(path);
        if candidate.is_dir() {
            return candidate;
        }
    }

    let candidates = [
        format!("assets/{}/{}", kind, name),
        format!("{}/{}", kind, name),
    ];
    for relative in candidates {
        if let Ok(resolved) = crate::commands::update::resolve_asset_path(&relative, app_handle)
            && resolved.is_dir()
        {
            return resolved;
        }
    }

    PathBuf::from(format!("assets/{}/{}", kind, name))
}

pub(super) fn resolve_update_balloon_dir(
    balloon_name: Option<&str>,
    balloon_path: Option<&str>,
    app_handle: &tauri::AppHandle,
) -> PathBuf {
    let name = balloon_name
        .map(str::trim)
        .filter(|n| !n.is_empty())
        .unwrap_or("default");
    resolve_update_asset_dir("balloon", name, balloon_path, app_handle)
}

pub(super) fn resolve_update_plugin_dir(
    plugin_name: &str,
    plugin_path: Option<&str>,
    app_handle: &tauri::AppHandle,
) -> PathBuf {
    resolve_update_asset_dir("plugin", plugin_name.trim(), plugin_path, app_handle)
}

pub(super) fn resolve_update_headline_dir(
    headline_name: &str,
    headline_path: Option<&str>,
    app_handle: &tauri::AppHandle,
) -> PathBuf {
    resolve_update_asset_dir("headline", headline_name.trim(), headline_path, app_handle)
}

pub(super) fn read_dir_homeurl(dir: &Path) -> Option<String> {
    let descript_path = dir.join("descript.txt");
    let map = crate::ghost::scan::read_descript_file(&descript_path)?;
    let url = map.get("homeurl")?.trim();
    if url.is_empty() {
        return None;
    }
    if url.ends_with('/') {
        Some(url.to_string())
    } else {
        Some(format!("{}/", url))
    }
}

pub(super) fn read_noupdate_patterns(dir: &Path) -> Vec<String> {
    let mut patterns = Vec::new();
    let dev_opt_path = dir.join("developer_options.txt");
    if dev_opt_path.is_file()
        && let Ok(content) = std::fs::read_to_string(&dev_opt_path)
    {
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
                continue;
            }
            if let Some(stripped) = trimmed.strip_prefix("noupdate=") {
                let pat = stripped.trim().replace('\\', "/");
                let pat = pat.strip_prefix("./").unwrap_or(&pat).to_string();
                if !pat.is_empty() {
                    patterns.push(pat);
                }
            } else if let Some((path_part, flags_part)) = trimmed.split_once(',') {
                let has_noupdate = flags_part
                    .split(',')
                    .any(|f| f.trim().eq_ignore_ascii_case("noupdate"));
                if has_noupdate {
                    let pat = path_part.trim().replace('\\', "/");
                    let pat = pat.strip_prefix("./").unwrap_or(&pat).to_string();
                    if !pat.is_empty() {
                        patterns.push(pat);
                    }
                }
            }
        }
    }
    patterns
}

pub(super) fn is_noupdate_excluded(rel_path: &str, patterns: &[String]) -> bool {
    let norm = rel_path.replace('\\', "/");
    let norm = norm.strip_prefix("./").unwrap_or(&norm);
    patterns.iter().any(|pat| {
        let pat_trimmed = pat.trim_end_matches('/');
        norm == pat_trimmed
            || norm.starts_with(&format!("{}/", pat_trimmed))
            || norm.ends_with(pat_trimmed)
    })
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
    phase: &'a str,
    path: &'a str,
    detail: Option<&'a str>,
}

impl<'a> ReportProgressParams<'a> {
    pub fn new(phase: &'a str, path: &'a str, detail: Option<&'a str>) -> Self {
        Self {
            phase,
            path,
            detail,
        }
    }

    // Add getter methods
    pub fn phase(&self) -> &'a str {
        self.phase
    }

    pub fn path(&self) -> &'a str {
        self.path
    }

    pub fn detail(&self) -> Option<&'a str> {
        self.detail
    }
}

/// 1ファイルごとの更新進捗をフロントエンドへ通知
/// (フロント側で OnUpdate.OnDownloadBegin / OnUpdate.OnMD5Compare* として SHIORI に中継する)
pub(super) fn report_progress(app_handle: &tauri::AppHandle, params: ReportProgressParams<'_>) {
    let payload = serde_json::json!({
        "phase": params.phase(),
        "path": params.path(),
        "detail": params.detail()
    });
    let _ = app_handle.emit("update-progress", payload);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_noupdate_patterns_and_exclusion() {
        let temp_dir = std::env::temp_dir().join("test_read_noupdate_patterns");
        let _ = std::fs::remove_dir_all(&temp_dir);
        std::fs::create_dir_all(&temp_dir).unwrap();

        std::fs::write(
            temp_dir.join("developer_options.txt"),
            "// comment\nnoupdate=ghost/master/save.dat\n./secret_dir,nonar,noupdate\n",
        )
        .unwrap();

        let patterns = read_noupdate_patterns(&temp_dir);
        assert_eq!(patterns, vec!["ghost/master/save.dat", "secret_dir"]);
        assert!(is_noupdate_excluded("ghost/master/save.dat", &patterns));
        assert!(is_noupdate_excluded("secret_dir/key.txt", &patterns));
        assert!(!is_noupdate_excluded("ghost/master/dic.txt", &patterns));

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_read_dir_homeurl() {
        let temp_dir = std::env::temp_dir().join("test_read_dir_homeurl");
        let _ = std::fs::remove_dir_all(&temp_dir);
        std::fs::create_dir_all(&temp_dir).unwrap();

        std::fs::write(
            temp_dir.join("descript.txt"),
            "name,TestShell\nhomeurl,https://example.com/shell\n",
        )
        .unwrap();

        assert_eq!(
            read_dir_homeurl(&temp_dir),
            Some("https://example.com/shell/".to_string())
        );

        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}

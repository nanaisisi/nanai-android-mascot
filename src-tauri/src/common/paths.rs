pub use nanai_vfs::{open_text_file, resolve_vfs_path};
use std::path::{Path, PathBuf};
use tauri::Manager;

/// Trait interface for path resolution utilities to define a stable public API
#[allow(dead_code)]
pub trait PathsInterface: Send + Sync {
    fn resolve_asset_path(
        &self,
        relative_path: &str,
        app_handle: &tauri::AppHandle,
    ) -> Result<PathBuf, String>;

    fn resolve_ghost_directory(
        &self,
        ghost_name: &str,
        app_handle: &tauri::AppHandle,
    ) -> Result<PathBuf, String>;

    fn clean_verbatim_path(&self, path_str: &str) -> String;

    fn normalize_path(&self, path: &Path) -> PathBuf;
}

#[allow(dead_code)]
pub struct AppPathResolver;

impl PathsInterface for AppPathResolver {
    fn resolve_asset_path(
        &self,
        relative_path: &str,
        app_handle: &tauri::AppHandle,
    ) -> Result<PathBuf, String> {
        resolve_asset_path(relative_path, app_handle)
    }

    fn resolve_ghost_directory(
        &self,
        ghost_name: &str,
        app_handle: &tauri::AppHandle,
    ) -> Result<PathBuf, String> {
        resolve_ghost_directory(ghost_name, app_handle)
    }

    fn clean_verbatim_path(&self, path_str: &str) -> String {
        clean_verbatim_path(path_str)
    }

    fn normalize_path(&self, path: &Path) -> PathBuf {
        normalize_path(path)
    }
}

fn expand_app_data_roots(app_data_dir: &Path) -> Vec<PathBuf> {
    vec![app_data_dir.to_path_buf(), app_data_dir.join("files")]
}

fn strip_assets_prefix(clean: &str) -> Option<PathBuf> {
    if clean == "assets" {
        return Some(PathBuf::from("."));
    }
    clean
        .strip_prefix("assets/")
        .or_else(|| clean.strip_prefix(r"assets\"))
        .filter(|s| !s.is_empty())
        .map(PathBuf::from)
}

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

    let mut path_candidates = vec![
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
        app_handle
            .path()
            .resource_dir()
            .map(|resource_dir| resource_dir.join(&path))
            .unwrap_or_else(|_| PathBuf::from(&path)),
        app_handle
            .path()
            .app_data_dir()
            .map(|app_dir| app_dir.join(&path))
            .unwrap_or_else(|_| PathBuf::from(&path)),
        std::env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(&path),
    ];

    if let Ok(app_dir) = app_handle.path().app_data_dir() {
        for base in expand_app_data_roots(&app_dir) {
            let candidate = base.join(&path);
            if !path_candidates.contains(&candidate) {
                path_candidates.push(candidate);
            }
        }
    }

    if let Some(stripped) = strip_assets_prefix(&clean) {
        if let Ok(app_dir) = app_handle.path().app_data_dir() {
            for base in expand_app_data_roots(&app_dir) {
                path_candidates.push(base.join(&stripped));
            }
        }
        if let Ok(resource_dir) = app_handle.path().resource_dir() {
            path_candidates.push(resource_dir.join(&stripped));
        }
    }

    for candidate in &path_candidates {
        if candidate.exists() {
            let normalized = normalize_path(candidate);
            return Ok(normalized);
        }

        if let Some(parent) = candidate.parent()
            && parent.exists()
            && let Some(file_name) = candidate.file_name().and_then(|n| n.to_str())
            && let Some(resolved) = resolve_vfs_path(parent, file_name)
        {
            let normalized = normalize_path(&resolved);
            return Ok(normalized);
        }
    }

    let fallback = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join(&path);

    Ok(normalize_path(&fallback))
}

pub fn resolve_ghost_directory(
    ghost_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    let safe_ghost_name: String = ghost_name
        .chars()
        .map(|c| if r#"\/:*?"<>| "#.contains(c) { '_' } else { c })
        .collect();
    let direct_candidates = [
        format!("assets/ghost/{ghost_name}"),
        format!("ghost/{ghost_name}"),
        format!("assets/ghost/{safe_ghost_name}"),
        format!("ghost/{safe_ghost_name}"),
    ];
    for candidate in direct_candidates {
        let resolved = resolve_asset_path(&candidate, app_handle)?;
        if resolved.is_dir() {
            return Ok(resolved);
        }
    }

    let mut roots = Vec::new();
    if let Ok(app_data_dir) = app_handle.path().app_data_dir() {
        for base in expand_app_data_roots(&app_data_dir) {
            roots.push(base.join("userData").join("ghost"));
            roots.push(base.join("ghost"));
        }
    }
    for root in ["assets/ghost", "ghost"] {
        if let Ok(resolved_root) = resolve_asset_path(root, app_handle) {
            roots.push(resolved_root);
        }
    }

    for resolved_root in roots {
        let Ok(entries) = std::fs::read_dir(&resolved_root) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }
            let folder_name = entry.file_name().to_string_lossy().to_string();
            if folder_name == ghost_name || folder_name == safe_ghost_name {
                return Ok(path);
            }
            let descriptors = [
                path.join("ghost").join("master").join("descript.txt"),
                path.join("descript.txt"),
                path.join("install.txt"),
            ];
            if descriptors
                .iter()
                .filter_map(|p| read_descript_file(p))
                .any(|meta| {
                    meta.get("name").is_some_and(|name| name == ghost_name)
                        || meta.get("directory").is_some_and(|dir| dir == ghost_name)
                })
            {
                return Ok(path);
            }
        }
    }

    Err(format!("Ghost directory not found: {ghost_name}"))
}

pub fn clean_verbatim_path(path_str: &str) -> String {
    let mut s = path_str.to_string();
    if let Some(stripped) = s.strip_prefix(r"\\?\") {
        s = stripped.to_string();
    }
    s.replace('/', std::path::MAIN_SEPARATOR_STR)
}

/// descript.txt の内容をパース（Shift_JIS / UTF-8 両対応）
pub fn read_descript_file(file_path: &Path) -> Option<std::collections::HashMap<String, String>> {
    if !file_path.exists() {
        return None;
    }
    let bytes = std::fs::read(file_path).ok()?;
    let text = if let Ok(utf8_str) = std::str::from_utf8(&bytes) {
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

    let mut map = std::collections::HashMap::new();
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }
        if let Some((key, val)) = trimmed.split_once(',') {
            map.insert(key.trim().to_lowercase(), val.trim().to_string());
        } else if let Some((key, val)) = trimmed.split_once(':') {
            map.insert(key.trim().to_lowercase(), val.trim().to_string());
        }
    }
    Some(map)
}

pub fn normalize_path(path: &Path) -> PathBuf {
    let canonical = if let Ok(canonical) = path.canonicalize() {
        canonical
    } else {
        let mut components = Vec::new();
        for component in path.components() {
            match component {
                std::path::Component::ParentDir => {
                    components.pop();
                }
                std::path::Component::CurDir => {}
                _ => {
                    components.push(component);
                }
            }
        }
        components.iter().collect()
    };

    let path_str = canonical.to_string_lossy();
    if let Some(stripped) = path_str.strip_prefix(r"\\?\") {
        PathBuf::from(stripped)
    } else {
        canonical
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_verbatim_path() {
        assert_eq!(
            clean_verbatim_path(r"\\?\C:\path\to\file"),
            r"C:\path\to\file"
        );
        let expected = format!("normal{}path", std::path::MAIN_SEPARATOR);
        assert_eq!(clean_verbatim_path("normal/path"), expected);
    }

    #[test]
    fn test_strip_assets_prefix() {
        assert_eq!(
            strip_assets_prefix("assets/ghost/mock_nanai"),
            Some(PathBuf::from("ghost/mock_nanai"))
        );
        assert_eq!(
            strip_assets_prefix(r"assets\balloon\nam"),
            Some(PathBuf::from(r"balloon\nam"))
        );
        assert_eq!(strip_assets_prefix("ghost/mock_nanai"), None);
        assert_eq!(strip_assets_prefix("assets"), Some(PathBuf::from(".")));
    }

    #[test]
    fn test_expand_app_data_roots() {
        let base = Path::new("/data/user/0/com.nanai_android_mascot.app");
        assert_eq!(
            expand_app_data_roots(base),
            vec![base.to_path_buf(), base.join("files")]
        );
    }
}

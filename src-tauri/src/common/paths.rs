use nanai_android_mascot_ui::resolve_vfs_path;
use std::path::{Path, PathBuf};
use tauri::Manager;

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

    let path_candidates = vec![
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
        roots.push(app_data_dir.join("userData").join("ghost"));
        roots.push(app_data_dir.join("ghost"));
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
                .filter_map(|p| crate::ghost::scan::read_descript_file(p))
                .any(|meta| {
                    meta.get("name").is_some_and(|name| name == ghost_name)
                        || meta
                            .get("directory")
                            .is_some_and(|dir| dir == ghost_name)
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
        assert_eq!(clean_verbatim_path(r"\\?\C:\path\to\file"), r"C:\path\to\file");
        let expected = format!("normal{}path", std::path::MAIN_SEPARATOR);
        assert_eq!(clean_verbatim_path("normal/path"), expected);
    }
}

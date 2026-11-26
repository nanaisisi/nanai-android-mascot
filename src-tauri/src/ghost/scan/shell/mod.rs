//! シェル（shell/ 配下）のスキャン

pub mod alias;
mod bitmap;
pub mod seriko;
mod theme;

pub use bitmap::load_shiori_menu_bitmap_data_url;

use crate::common::models::ShellInfo;
use std::collections::HashMap;
use std::path::Path;

use super::descript::read_descript_file;
use theme::extract_shell_menu_theme;

/// ゴースト内の全シェル（shell/ 配下）をスキャン
pub fn scan_shells_from_ghost(ghost_dir: &Path) -> Vec<ShellInfo> {
    let mut shells = Vec::new();
    let shell_base = nanai_vfs::resolve_vfs_path(ghost_dir, "shell")
        .filter(|p| p.is_dir())
        .unwrap_or_else(|| ghost_dir.join("shell"));
    let ghost_master_dir = nanai_vfs::resolve_vfs_path(ghost_dir, "ghost")
        .and_then(|g| nanai_vfs::resolve_vfs_path(&g, "master"))
        .filter(|p| p.is_dir())
        .unwrap_or_else(|| ghost_dir.join("ghost").join("master"));
    let master_descript_path = nanai_vfs::resolve_vfs_path(&ghost_master_dir, "descript.txt")
        .unwrap_or_else(|| ghost_master_dir.join("descript.txt"));
    let root_descript_path = nanai_vfs::resolve_vfs_path(ghost_dir, "descript.txt")
        .unwrap_or_else(|| ghost_dir.join("descript.txt"));
    let master_descript = read_descript_file(&master_descript_path)
        .or_else(|| read_descript_file(&root_descript_path))
        .unwrap_or_default();

    if let Ok(entries) = std::fs::read_dir(&shell_base) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let shell_name = entry.file_name().to_string_lossy().to_string();
                if !shell_name.starts_with('.') {
                    let mut display_name = None;
                    let mut menu_theme = None;
                    let descript_path = nanai_vfs::resolve_vfs_path(&path, "descript.txt")
                        .unwrap_or_else(|| path.join("descript.txt"));
                    let shell_map = read_descript_file(&descript_path);

                    let mut merged: HashMap<String, String> = master_descript.clone();
                    if let Some(ref sm) = shell_map {
                        display_name = sm.get("name").cloned();
                        for (k, v) in sm {
                            merged.insert(k.clone(), v.clone());
                        }
                    }

                    if !merged.is_empty() {
                        menu_theme =
                            extract_shell_menu_theme(&merged, &path, &ghost_master_dir, ghost_dir);
                    }
                    shells.push(ShellInfo {
                        name: shell_name,
                        path: path.to_string_lossy().to_string(),
                        display_name,
                        menu_theme,
                    });
                }
            }
        }
    }
    // masterシェルを先頭に優先ソート
    shells.sort_by(|a, b| match (a.name.as_str(), b.name.as_str()) {
        ("master", "master") => std::cmp::Ordering::Equal,
        ("master", _) => std::cmp::Ordering::Less,
        (_, "master") => std::cmp::Ordering::Greater,
        _ => a.name.cmp(&b.name),
    });
    // masterシェルが存在しない場合のフォールバック
    if shells.is_empty() {
        shells.push(ShellInfo {
            name: "master".to_string(),
            path: shell_base.join("master").to_string_lossy().to_string(),
            display_name: Some("master".to_string()),
            menu_theme: None,
        });
    }
    shells
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scans_mixed_case_shell_directories() {
        let dir = std::env::temp_dir().join(format!("nam_scan_shell_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let shell_dir = dir.join("Shell").join("Master");
        std::fs::create_dir_all(&shell_dir).unwrap();
        std::fs::write(
            shell_dir.join("Descript.txt"),
            "type,shell\nname,CustomMaster\n",
        )
        .unwrap();

        let shells = scan_shells_from_ghost(&dir);
        assert_eq!(shells.len(), 1);
        assert_eq!(shells[0].name, "Master");
        assert_eq!(shells[0].display_name.as_deref(), Some("CustomMaster"));

        let _ = std::fs::remove_dir_all(&dir);
    }
}

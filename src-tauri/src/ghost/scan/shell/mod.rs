//! シェル（shell/ 配下）のスキャン

mod bitmap;
mod theme;

use crate::common::*;
use std::collections::HashMap;
use std::path::Path;

use super::descript::read_descript_file;
use theme::extract_shell_menu_theme;

/// ゴースト内の全シェル（shell/ 配下）をスキャン
pub fn scan_shells_from_ghost(ghost_dir: &Path) -> Vec<ShellInfo> {
    let mut shells = Vec::new();
    let shell_base = ghost_dir.join("shell");
    let ghost_master_dir = ghost_dir.join("ghost").join("master");
    let master_descript = read_descript_file(&ghost_master_dir.join("descript.txt"))
        .or_else(|| read_descript_file(&ghost_dir.join("descript.txt")))
        .unwrap_or_default();

    if let Ok(entries) = std::fs::read_dir(&shell_base) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let shell_name = entry.file_name().to_string_lossy().to_string();
                if !shell_name.starts_with('.') {
                    let mut display_name = None;
                    let mut menu_theme = None;
                    let descript_path = path.join("descript.txt");
                    let shell_map = read_descript_file(&descript_path);

                    let mut merged: HashMap<String, String> = master_descript.clone();
                    if let Some(ref sm) = shell_map {
                        display_name = sm.get("name").cloned();
                        for (k, v) in sm {
                            merged.insert(k.clone(), v.clone());
                        }
                    }

                    if !merged.is_empty() {
                        menu_theme = extract_shell_menu_theme(
                            &merged,
                            &path,
                            &ghost_master_dir,
                            ghost_dir,
                        );
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

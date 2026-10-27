//! シェル（shell/ 配下）のスキャン

use crate::common::*;
use std::path::Path;

use super::descript::read_descript_file;

/// ゴースト内の全シェル（shell/ 配下）をスキャン
pub fn scan_shells_from_ghost(ghost_dir: &Path) -> Vec<ShellInfo> {
    let mut shells = Vec::new();
    let shell_base = ghost_dir.join("shell");
    if let Ok(entries) = std::fs::read_dir(&shell_base) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let shell_name = entry.file_name().to_string_lossy().to_string();
                if !shell_name.starts_with('.') {
                    let mut display_name = None;
                    let mut menu_theme = None;
                    let descript_path = path.join("descript.txt");
                    if let Some(map) = read_descript_file(&descript_path) {
                        display_name = map.get("name").cloned();

                        // メニュー配色・画像情報の抽出
                        let parse_color = |key_base: &str| -> Option<String> {
                            if let (Some(r), Some(g), Some(b)) = (
                                map.get(&format!("{}.r", key_base)),
                                map.get(&format!("{}.g", key_base)),
                                map.get(&format!("{}.b", key_base)),
                            ) {
                                return Some(format!("rgb({}, {}, {})", r, g, b));
                            }
                            if let Some(val) = map.get(key_base) {
                                let parts: Vec<&str> = val.split(',').map(|s| s.trim()).collect();
                                if parts.len() == 3 {
                                    return Some(format!(
                                        "rgb({}, {}, {})",
                                        parts[0], parts[1], parts[2]
                                    ));
                                } else if val.starts_with('#') || val.starts_with("rgb") {
                                    return Some(val.clone());
                                }
                            }
                            None
                        };

                        let bg_color = parse_color("menu.background.color");
                        let fg_color = parse_color("menu.foreground.color");
                        let font_col = parse_color("font.color");
                        let bg_font_col =
                            parse_color("menu.background.font.color").or_else(|| font_col.clone());
                        let fg_font_col = parse_color("menu.foreground.font.color");
                        let dis_font_col = parse_color("menu.disable.font.color");
                        let sep_col = parse_color("menu.separator.color");

                        let bg_bmp = map.get("menu.background.bitmap.filename").cloned();
                        let fg_bmp = map.get("menu.foreground.bitmap.filename").cloned();
                        let side_bmp = map.get("menu.sidebar.bitmap.filename").cloned();

                        if bg_color.is_some()
                            || fg_color.is_some()
                            || bg_font_col.is_some()
                            || fg_font_col.is_some()
                            || dis_font_col.is_some()
                            || sep_col.is_some()
                            || bg_bmp.is_some()
                            || fg_bmp.is_some()
                            || side_bmp.is_some()
                        {
                            menu_theme = Some(ShellMenuTheme {
                                background_color: bg_color,
                                foreground_color: fg_color,
                                font_color: font_col,
                                background_font_color: bg_font_col,
                                foreground_font_color: fg_font_col,
                                disable_font_color: dis_font_col,
                                separator_color: sep_col,
                                background_bitmap: bg_bmp,
                                foreground_bitmap: fg_bmp,
                                sidebar_bitmap: side_bmp,
                            });
                        }
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

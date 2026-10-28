//! シェル（shell/ 配下）のスキャン

use crate::common::*;
use base64::Engine;
use std::collections::HashMap;
use std::path::Path;

use super::descript::read_descript_file;

/// メニュー画像（background / foreground / sidebar）を読み込んで Data URL (base64) に変換する
fn load_menu_bitmap_data_url(
    rel_path: &str,
    shell_dir: &Path,
    ghost_master_dir: &Path,
    ghost_dir: &Path,
) -> Option<String> {
    let normalized = rel_path.trim().replace('\\', "/");
    if normalized.is_empty() {
        return None;
    }
    if normalized.starts_with("data:")
        || normalized.starts_with("http://")
        || normalized.starts_with("https://")
    {
        return Some(normalized);
    }

    let search_bases = [shell_dir, ghost_master_dir, ghost_dir];
    for base in search_bases {
        let direct = base.join(&normalized);
        let resolved = if direct.is_file() {
            Some(direct)
        } else {
            nanai_android_mascot_ui::resolve_vfs_path(base, &normalized)
        };
        if let Some(target) = resolved
            && target.is_file()
            && let Ok(bytes) = std::fs::read(&target)
        {
            let ext = target
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png")
                .to_ascii_lowercase();
            let mime = match ext.as_str() {
                "bmp" => "image/bmp",
                "jpg" | "jpeg" => "image/jpeg",
                "gif" => "image/gif",
                "svg" => "image/svg+xml",
                "webp" => "image/webp",
                _ => "image/png",
            };
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Some(format!("data:{mime};base64,{b64}"));
        }
    }
    None
}

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

                    // ghost/master/descript.txt をベースにし、shell/<name>/descript.txt で上書きマージ (UKADOC準拠)
                    let mut merged: HashMap<String, String> = master_descript.clone();
                    if let Some(ref sm) = shell_map {
                        display_name = sm.get("name").cloned();
                        for (k, v) in sm {
                            merged.insert(k.clone(), v.clone());
                        }
                    }

                    if !merged.is_empty() {
                        // メニュー配色・画像情報の抽出
                        let parse_color = |key_base: &str| -> Option<String> {
                            if let (Some(r), Some(g), Some(b)) = (
                                merged.get(&format!("{}.r", key_base)),
                                merged.get(&format!("{}.g", key_base)),
                                merged.get(&format!("{}.b", key_base)),
                            ) {
                                return Some(format!("rgb({}, {}, {})", r, g, b));
                            }
                            if let Some(val) = merged.get(key_base) {
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

                        let bg_bmp = merged
                            .get("menu.background.bitmap.filename")
                            .and_then(|rel| {
                                load_menu_bitmap_data_url(rel, &path, &ghost_master_dir, ghost_dir)
                            });
                        let fg_bmp = merged
                            .get("menu.foreground.bitmap.filename")
                            .and_then(|rel| {
                                load_menu_bitmap_data_url(rel, &path, &ghost_master_dir, ghost_dir)
                            });
                        let side_bmp = merged
                            .get("menu.sidebar.bitmap.filename")
                            .and_then(|rel| {
                                load_menu_bitmap_data_url(rel, &path, &ghost_master_dir, ghost_dir)
                            });

                        let bg_align = merged.get("menu.background.alignment").cloned();
                        let fg_align = merged.get("menu.foreground.alignment").cloned();
                        let side_align = merged.get("menu.sidebar.alignment").cloned();

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
                                background_alignment: bg_align,
                                foreground_alignment: fg_align,
                                sidebar_alignment: side_align,
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

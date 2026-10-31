use crate::common::*;
use std::collections::HashMap;
use std::path::Path;
use super::bitmap::load_menu_bitmap_data_url;

pub fn extract_shell_menu_theme(
    merged: &HashMap<String, String>,
    path: &Path,
    ghost_master_dir: &Path,
    ghost_dir: &Path,
) -> Option<ShellMenuTheme> {
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

    let font_col = parse_color("font.color");
    let bg_color = parse_color("menu.background.color");
    let fg_color = parse_color("menu.foreground.color");
    let bg_font_col =
        parse_color("menu.background.font.color").or_else(|| font_col.clone());
    let fg_font_col = parse_color("menu.foreground.font.color");
    let dis_font_col = parse_color("menu.disable.font.color");
    let sep_col = parse_color("menu.separator.color");

    let bg_bmp = merged
        .get("menu.background.bitmap.filename")
        .and_then(|rel| load_menu_bitmap_data_url(rel, path, ghost_master_dir, ghost_dir));
    let fg_bmp = merged
        .get("menu.foreground.bitmap.filename")
        .and_then(|rel| load_menu_bitmap_data_url(rel, path, ghost_master_dir, ghost_dir));
    let side_bmp = merged
        .get("menu.sidebar.bitmap.filename")
        .and_then(|rel| load_menu_bitmap_data_url(rel, path, ghost_master_dir, ghost_dir));

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
        Some(ShellMenuTheme {
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
        })
    } else {
        None
    }
}

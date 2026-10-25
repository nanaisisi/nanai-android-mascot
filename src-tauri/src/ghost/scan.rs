#![allow(unused_imports)]
use crate::common::*;
use nanai_android_mascot_ui::{open_shift_jis_file, resolve_vfs_path};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};
// ========================================
// SHIORI関連のTauriコマンド
// ========================================

/// ゴーストスキャン結果
#[derive(Debug, Clone, serde::Serialize)]
pub struct ScanResult {
    ghosts: Vec<GhostInfo>,
    resolved_path: String,
    input_path: String,
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
                            || bg_bmp.is_some()
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

/// ゴーストディレクトリをフルスキャンして完全なゴースト情報を取得
#[tauri::command]
pub async fn scan_ghost_directory(
    _state: tauri::State<'_, AppState>,
    ghost_dir: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    let ghost_path = resolve_asset_path(&ghost_dir, &app_handle)?;

    println!("🔍 Input path: {}", ghost_dir);
    println!("🔍 Resolved absolute path: {:?}", ghost_path);

    let mut ghosts = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&ghost_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let dir_name = entry.file_name().to_string_lossy().to_string();
                if !dir_name.starts_with('.') {
                    // ghost/master/descript.txt または descript.txt
                    let descript_candidates = [
                        path.join("ghost").join("master").join("descript.txt"),
                        path.join("descript.txt"),
                        path.join("install.txt"),
                    ];
                    let mut meta_map = None;
                    for cand in &descript_candidates {
                        if let Some(map) = read_descript_file(cand) {
                            meta_map = Some(map);
                            break;
                        }
                    }

                    let display_name = meta_map
                        .as_ref()
                        .and_then(|m| m.get("name").cloned())
                        .unwrap_or_else(|| dir_name.clone());

                    let sakura_name = meta_map
                        .as_ref()
                        .and_then(|m| m.get("sakura.name").cloned());
                    let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());
                    let shiori = meta_map.as_ref().and_then(|m| m.get("shiori").cloned());
                    let craftman = meta_map.as_ref().and_then(|m| m.get("craftman").cloned());
                    let craftman_url = meta_map
                        .as_ref()
                        .and_then(|m| m.get("craftmanurl").cloned());

                    // 全シェルをスキャン
                    let shells = scan_shells_from_ghost(&path);

                    ghosts.push(GhostInfo {
                        name: display_name,
                        path: path.to_string_lossy().to_string(),
                        sakura_name,
                        kero_name,
                        shiori,
                        craftman,
                        craftman_url,
                        shells,
                    });
                }
            }
        }
    }

    if ghosts.is_empty() {
        let mock_nanai_path = ghost_path.join("mock_nanai");
        if mock_nanai_path.exists() {
            let shells = scan_shells_from_ghost(&mock_nanai_path);
            ghosts.push(GhostInfo {
                name: "mock_nanai".to_string(),
                path: mock_nanai_path.to_string_lossy().to_string(),
                sakura_name: Some("なない".to_string()),
                kero_name: None,
                shiori: None,
                craftman: None,
                craftman_url: None,
                shells,
            });
        }
    }

    let result = ScanResult {
        ghosts,
        resolved_path: ghost_path.to_string_lossy().to_string(),
        input_path: ghost_dir,
    };

    println!("📊 Scan completed: {} ghosts found", result.ghosts.len());

    Ok(result)
}

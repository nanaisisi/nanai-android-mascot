#![allow(unused_imports)]
use crate::common::*;
use nanai_android_mascot_ui::{open_shift_jis_file, resolve_vfs_path};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};
pub fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(
    mut zip: zip::ZipArchive<R>,
    fallback_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<GhostInfo, String> {
    // アーカイブ内のinstall.txtまたはdescript.txtを検索してゴースト名を特定
    let mut ghost_name = String::new();
    let mut root_prefix = String::new();

    for i in 0..zip.len() {
        if let Ok(entry) = zip.by_index(i) {
            let raw_bytes = entry.name_raw();
            let decoded_name = if let Ok(s) = std::str::from_utf8(raw_bytes) {
                s.to_string()
            } else {
                let (cow, _, _) = encoding_rs::SHIFT_JIS.decode(raw_bytes);
                cow.into_owned()
            };
            let name = decoded_name.replace('\\', "/");
            let lower = name.to_lowercase();
            if lower.ends_with("install.txt") || lower.ends_with("descript.txt") {
                // ファイル内容をShift_JIS / UTF-8で読み取り
                let mut reader = entry;
                let mut bytes = Vec::new();
                use std::io::Read;
                if reader.read_to_end(&mut bytes).is_ok() {
                    // 1. UTF-8判定（有効なUTF-8であればUTF-8を優先、不正バイト時のみShift_JIS）
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

                    for line in text.lines() {
                        let trimmed = line.trim();
                        if let Some(val) = trimmed.strip_prefix("name,") {
                            ghost_name = val.trim().to_string();
                            break;
                        } else if let Some(val) = trimmed.strip_prefix("name:") {
                            ghost_name = val.trim().to_string();
                            break;
                        }
                    }
                }

                if lower.ends_with("install.txt") {
                    if let Some(idx) = name.rfind('/') {
                        root_prefix = name[..=idx].to_string();
                    }
                    if !ghost_name.is_empty() {
                        break;
                    }
                }
            }
        }
    }

    // ゴースト名が見つからない場合はフォールバック名を使用
    if ghost_name.is_empty() {
        ghost_name = fallback_name.to_string();
    }

    // サニタイズ（フォルダ名に使用できない文字を除去）
    let safe_dir_name: String = ghost_name
        .chars()
        .map(|c| if r#"\/:*?"<>| "#.contains(c) { '_' } else { c })
        .collect();

    let target_ghost_base = resolve_asset_path("assets/ghost", app_handle)?;
    let target_dir = target_ghost_base.join(&safe_dir_name);

    if !target_dir.exists() {
        std::fs::create_dir_all(&target_dir)
            .map_err(|e| format!("Failed to create destination dir: {}", e))?;
    }

    // アーカイブを展開
    for i in 0..zip.len() {
        let mut entry = zip
            .by_index(i)
            .map_err(|e| format!("Failed to read archive entry #{}: {}", i, e))?;

        let raw_bytes = entry.name_raw();
        let decoded_name = if let Ok(s) = std::str::from_utf8(raw_bytes) {
            s.to_string()
        } else {
            let (cow, _, _) = encoding_rs::SHIFT_JIS.decode(raw_bytes);
            cow.into_owned()
        };
        let entry_name = decoded_name.replace('\\', "/");

        // root_prefixの除去
        let relative_path = if !root_prefix.is_empty() && entry_name.starts_with(&root_prefix) {
            &entry_name[root_prefix.len()..]
        } else {
            &entry_name
        };

        if relative_path.is_empty() {
            continue;
        }

        // パストラバーサル防止 (Zip Slip)
        let out_path = target_dir.join(relative_path);
        let normalized = normalize_path(&out_path);
        if !normalized.starts_with(&target_dir) {
            return Err(format!("Illegal path in archive: {}", entry_name));
        }

        if entry.is_dir() {
            std::fs::create_dir_all(&out_path).ok();
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent).ok();
            }
            let mut outfile = std::fs::File::create(&out_path)
                .map_err(|e| format!("Failed to extract '{}': {}", out_path.display(), e))?;
            std::io::copy(&mut entry, &mut outfile)
                .map_err(|e| format!("Failed writing file '{}': {}", out_path.display(), e))?;
        }
    }

    println!("✅ Ghost successfully installed to: {:?}", target_dir);

    let shells = crate::ghost::scan::scan_shells_from_ghost(&target_dir);
    let descript_candidates = [
        target_dir.join("ghost").join("master").join("descript.txt"),
        target_dir.join("descript.txt"),
        target_dir.join("install.txt"),
    ];
    let mut meta_map = None;
    for cand in &descript_candidates {
        if let Some(map) = crate::ghost::scan::read_descript_file(cand) {
            meta_map = Some(map);
            break;
        }
    }

    let display_name = meta_map
        .as_ref()
        .and_then(|m| m.get("name").cloned())
        .unwrap_or_else(|| safe_dir_name.clone());

    let sakura_name = meta_map.as_ref().and_then(|m| m.get("sakura.name").cloned());
    let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());
    let shiori = meta_map.as_ref().and_then(|m| m.get("shiori").cloned());
    let craftman = meta_map.as_ref().and_then(|m| m.get("craftman").cloned());
    let craftman_url = meta_map.as_ref().and_then(|m| m.get("craftmanurl").cloned());

    Ok(GhostInfo {
        name: display_name,
        path: target_dir.to_string_lossy().to_string(),
        sakura_name,
        kero_name,
        shiori,
        craftman,
        craftman_url,
        shells,
    })
}

/// ゴーストアーカイブ (.nar / .zip) のパス指定取り込み・解凍コマンド
#[tauri::command]
pub async fn install_ghost_archive(
    archive_path: String,
    app_handle: tauri::AppHandle,
) -> Result<GhostInfo, String> {
    println!("📦 Installing ghost archive from path: {}", archive_path);
    let clean = clean_verbatim_path(&archive_path);
    let file = std::fs::File::open(&clean)
        .map_err(|e| format!("Failed to open archive '{}': {}", clean, e))?;

    let zip = zip::ZipArchive::new(file).map_err(|e| format!("Invalid zip/nar archive: {}", e))?;

    let p = Path::new(&clean);
    let fallback = p
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "imported_ghost".to_string());

    extract_ghost_archive_from_reader(zip, &fallback, &app_handle)
}

/// ゴーストアーカイブ (.nar / .zip) のバイナリ直接取り込み・解凍コマンド
#[tauri::command]
pub async fn install_ghost_archive_bytes(
    file_name: String,
    bytes: Vec<u8>,
    app_handle: tauri::AppHandle,
) -> Result<GhostInfo, String> {
    println!(
        "📦 Installing ghost archive from memory bytes: {} ({} bytes)",
        file_name,
        bytes.len()
    );
    let reader = std::io::Cursor::new(bytes);
    let zip =
        zip::ZipArchive::new(reader).map_err(|e| format!("Invalid zip/nar archive: {}", e))?;

    let p = Path::new(&file_name);
    let fallback = p
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "imported_ghost".to_string());

    extract_ghost_archive_from_reader(zip, &fallback, &app_handle)
}

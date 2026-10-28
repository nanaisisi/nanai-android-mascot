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
    // 1. アーカイブ内の install.txt (最浅階層を最優先) または descript.txt を検索し、
    //    バンドルバルーンの balloon/install.txt に誤爆しないよう選別する
    let mut best_install_idx: Option<(usize, usize)> = None; // (depth, index)
    let mut best_descript_idx: Option<(usize, usize)> = None; // (priority, index)

    for i in 0..zip.len() {
        if let Ok(entry) = zip.by_index(i) {
            let decoded_name = decode_zip_entry_name(entry.name_raw());
            let name = decoded_name.replace('\\', "/");
            let lower = name.to_lowercase();
            let depth = lower.matches('/').count();

            if lower == "install.txt" || lower.ends_with("/install.txt") {
                if best_install_idx.is_none_or(|(best_depth, _)| depth < best_depth) {
                    best_install_idx = Some((depth, i));
                }
            } else if lower == "descript.txt" || lower.ends_with("/descript.txt") {
                // ghost/master/descript.txt を最優先
                let prio = if lower.ends_with("ghost/master/descript.txt") {
                    0
                } else {
                    1 + depth
                };
                if best_descript_idx.is_none_or(|(best_prio, _)| prio < best_prio) {
                    best_descript_idx = Some((prio, i));
                }
            }
        }
    }

    let mut ghost_name = String::new();
    let mut root_prefix = String::new();
    let mut install_type: Option<String> = None;
    let mut install_directory: Option<String> = None;
    let mut balloon_directory: Option<String> = None;
    let mut balloon_source_directory: Option<String> = None;

    if let Some((_, idx)) = best_install_idx
        && let Ok(mut entry) = zip.by_index(idx)
    {
        let name = decode_zip_entry_name(entry.name_raw()).replace('\\', "/");
        if let Some(slash_idx) = name.rfind('/') {
            root_prefix = name[..=slash_idx].to_string();
        }
        let map = parse_zip_entry_descript(&mut entry);
        if let Some(val) = map.get("name") {
            ghost_name = val.clone();
        }
        if let Some(val) = map.get("type") {
            install_type = Some(val.clone());
        }
        if let Some(val) = map.get("directory") {
            install_directory = Some(val.clone());
        }
        if let Some(val) = map.get("balloon.directory") {
            balloon_directory = Some(val.clone());
        }
        if let Some(val) = map.get("balloon.source.directory") {
            balloon_source_directory = Some(val.clone());
        }
    }

    if ghost_name.is_empty()
        && let Some((_, idx)) = best_descript_idx
        && let Ok(mut entry) = zip.by_index(idx)
    {
        let map = parse_zip_entry_descript(&mut entry);
        if let Some(val) = map.get("name") {
            ghost_name = val.clone();
        }
        if install_type.is_none()
            && let Some(val) = map.get("type")
        {
            install_type = Some(val.clone());
        }
    }

    // ゴースト名が見つからない場合はフォールバック名を使用
    if ghost_name.is_empty() {
        ghost_name = fallback_name.to_string();
    }

    // install.txt の type 種別を検証 (ukadoc準拠: Ghost / Shell / Balloon / Plugin / Headline / Supplement / Package)
    let kind = install_type
        .as_deref()
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_lowercase())
        .unwrap_or_else(|| "ghost".to_string());
    if kind != "ghost"
        && kind != "balloon"
        && kind != "shell"
        && kind != "plugin"
        && kind != "headline"
        && kind != "supplement"
        && kind != "package"
    {
        let label = install_type.unwrap_or_default();
        return Err(format!(
            "install.txt type={label} ({kind}): サポートされていないアーカイブ種別です"
        ));
    }

    // サニタイズ（フォルダ名に使用できない文字を除去）
    // install.txt に directory 指定がある場合は、既存の同名ゴーストフォルダがなければ directory 指定も考慮しつつ安全に生成
    let raw_dir_name = install_directory
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or(&ghost_name);
    let safe_dir_name = sanitize_dir_name(raw_dir_name);
    let alt_safe_name = sanitize_dir_name(&ghost_name);

    let target_base = match kind.as_str() {
        "balloon" => resolve_asset_path("assets/balloon", app_handle)?,
        "shell" => resolve_asset_path("assets/shell", app_handle)?,
        "plugin" => resolve_asset_path("assets/plugin", app_handle)?,
        "headline" => resolve_asset_path("assets/headline", app_handle)?,
        _ => resolve_asset_path("assets/ghost", app_handle)?,
    };
    // 既に表示名ベースのフォルダが存在する場合はそちらを優先更新し、新規なら directory 指定名を使用
    let target_dir = if target_base.join(&alt_safe_name).exists() {
        target_base.join(&alt_safe_name)
    } else {
        target_base.join(&safe_dir_name)
    };

    if !target_dir.exists() {
        std::fs::create_dir_all(&target_dir)
            .map_err(|e| format!("Failed to create destination dir: {}", e))?;
    }

    // 同梱バルーン (balloon.directory / balloon.source.directory) の展開設定
    let bundled_balloon = if kind == "ghost" || kind == "package" {
        if let Some(ref b_dir) = balloon_directory {
            let src_dir = balloon_source_directory
                .as_deref()
                .unwrap_or(b_dir.as_str())
                .trim_matches('/')
                .to_string();
            let dest_name = sanitize_dir_name(b_dir);
            if !src_dir.is_empty() && !dest_name.is_empty() {
                let balloon_base = resolve_asset_path("assets/balloon", app_handle)?;
                let balloon_dest = balloon_base.join(&dest_name);
                std::fs::create_dir_all(&balloon_dest).ok();
                Some((format!("{src_dir}/"), balloon_dest))
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };

    // アーカイブを展開
    for i in 0..zip.len() {
        let mut entry = zip
            .by_index(i)
            .map_err(|e| format!("Failed to read archive entry #{}: {}", i, e))?;

        let decoded_name = decode_zip_entry_name(entry.name_raw());
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

        // 同梱バルーンのディレクトリ配下なら assets/balloon/<balloon.directory> へ振り分け展開
        let (active_target_dir, active_rel_path) =
            if let Some((ref src_prefix, ref balloon_dest)) = bundled_balloon
                && relative_path.len() >= src_prefix.len()
                && relative_path[..src_prefix.len()].eq_ignore_ascii_case(src_prefix)
            {
                let sub = &relative_path[src_prefix.len()..];
                if sub.is_empty() {
                    continue;
                }
                (balloon_dest, sub)
            } else {
                (&target_dir, relative_path)
            };

        // パストラバーサル防止 (Zip Slip)
        let out_path = active_target_dir.join(active_rel_path);
        let normalized = normalize_path(&out_path);
        if !normalized.starts_with(active_target_dir) {
            return Err(format!("Illegal path in archive: {}", entry_name));
        }

        if entry.is_dir() {
            std::fs::create_dir_all(&out_path).ok();
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent).ok();
            }
            let entry_mtime = entry.last_modified().and_then(zip_datetime_to_system_time);
            let mut outfile = std::fs::File::create(&out_path)
                .map_err(|e| format!("Failed to extract '{}': {}", out_path.display(), e))?;
            std::io::copy(&mut entry, &mut outfile)
                .map_err(|e| format!("Failed writing file '{}': {}", out_path.display(), e))?;
            if let Some(mtime) = entry_mtime {
                let _ = outfile.set_modified(mtime);
            }
        }
    }

    if kind == "balloon" {
        flatten_balloon_directory(&target_dir)?;
    }

    println!("✅ Archive successfully installed to: {:?}", target_dir);

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
    let version = meta_map.as_ref().and_then(|m| m.get("version").cloned());

    let sakura_name = meta_map
        .as_ref()
        .and_then(|m| m.get("sakura.name").cloned());
    let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());
    let shiori = meta_map.as_ref().and_then(|m| m.get("shiori").cloned());
    let craftman = meta_map.as_ref().and_then(|m| m.get("craftman").cloned());
    let craftman_url = meta_map
        .as_ref()
        .and_then(|m| m.get("craftmanurl").cloned());
    let group = meta_map.as_ref().and_then(|m| m.get("group").cloned());

    let (install_date, update_date) =
        crate::ghost::scan::compute_ghost_dates(&target_dir);

    Ok(GhostInfo {
        name: display_name,
        version,
        path: target_dir.to_string_lossy().to_string(),
        sakura_name,
        kero_name,
        shiori,
        craftman,
        craftman_url,
        shells,
        group,
        install_date,
        update_date,
        update_result: Some("正常 (インストール済)".to_string()),
    })
}

fn decode_zip_entry_name(raw_bytes: &[u8]) -> String {
    if let Ok(s) = std::str::from_utf8(raw_bytes) {
        s.to_string()
    } else {
        let (cow, _, _) = encoding_rs::SHIFT_JIS.decode(raw_bytes);
        cow.into_owned()
    }
}

fn parse_zip_entry_descript(entry: &mut impl std::io::Read) -> std::collections::HashMap<String, String> {
    let mut map = std::collections::HashMap::new();
    let mut bytes = Vec::new();
    if entry.read_to_end(&mut bytes).is_err() {
        return map;
    }
    let text = if let Ok(utf8_str) = std::str::from_utf8(&bytes) {
        let lower = utf8_str.to_lowercase();
        if lower.contains("charset,shift_jis") || lower.contains("charset,sjis") {
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
        let trimmed = line.trim().trim_start_matches('\u{feff}');
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }
        if let Some((key, val)) = trimmed.split_once(',').or_else(|| trimmed.split_once(':')) {
            let k = key.trim().to_lowercase();
            let v = val.trim().trim_end_matches(',').trim().to_string();
            if !k.is_empty() && !v.is_empty() {
                map.insert(k, v);
            }
        }
    }
    map
}

fn sanitize_dir_name(raw: &str) -> String {
    raw.chars()
        .map(|c| if r#"\/:*?"<>| "#.contains(c) { '_' } else { c })
        .collect()
}

fn zip_datetime_to_system_time(dt: zip::DateTime) -> Option<std::time::SystemTime> {
    let year = dt.year() as i64;
    let month = dt.month() as usize;
    let day = dt.day() as i64;
    if year < 1970 || !(1..=12).contains(&month) || !(1..=31).contains(&day) {
        return None;
    }

    let mut days = 0i64;
    for y in 1970..year {
        let leap = (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);
        days += if leap { 366 } else { 365 };
    }
    let leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    let days_in_months = [
        31,
        if leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    for &dim in &days_in_months[..(month - 1)] {
        days += dim;
    }
    days += day - 1;

    let secs = (days as u64) * 86_400
        + (dt.hour() as u64) * 3_600
        + (dt.minute() as u64) * 60
        + (dt.second() as u64);
    std::time::UNIX_EPOCH.checked_add(std::time::Duration::from_secs(secs))
}

fn flatten_balloon_directory(target_dir: &Path) -> Result<(), String> {
    let entries: Vec<PathBuf> = std::fs::read_dir(target_dir)
        .map_err(|e| format!("Failed to inspect balloon directory: {e}"))?
        .flatten()
        .map(|entry| entry.path())
        .collect();

    let wrapper = if target_dir.join("balloon").is_dir() {
        Some(target_dir.join("balloon"))
    } else if entries.len() == 1 && entries[0].is_dir() {
        Some(entries[0].clone())
    } else {
        None
    };

    let Some(wrapper) = wrapper else {
        return Ok(());
    };

    let children: Vec<PathBuf> = std::fs::read_dir(&wrapper)
        .map_err(|e| format!("Failed to inspect balloon wrapper: {e}"))?
        .flatten()
        .map(|entry| entry.path())
        .collect();
    for child in children {
        let destination = target_dir.join(
            child
                .file_name()
                .ok_or_else(|| "Invalid balloon archive entry".to_string())?,
        );
        if destination.exists() {
            if destination.is_dir() {
                std::fs::remove_dir_all(&destination)
                    .map_err(|e| format!("Failed to replace balloon entry: {e}"))?;
            } else {
                std::fs::remove_file(&destination)
                    .map_err(|e| format!("Failed to replace balloon entry: {e}"))?;
            }
        }
        std::fs::rename(&child, &destination)
            .map_err(|e| format!("Failed to normalize balloon entry: {e}"))?;
    }
    std::fs::remove_dir(&wrapper).map_err(|e| format!("Failed to remove balloon wrapper: {e}"))?;
    Ok(())
}

/// ネイティブのファイル選択ダイアログを開き、選んだアーカイブを取り込む。キャンセル時は None
#[tauri::command]
pub async fn pick_and_install_ghost_archive(
    app_handle: tauri::AppHandle,
) -> Result<Option<GhostInfo>, String> {
    use tauri_plugin_dialog::DialogExt;
    let state = app_handle.state::<crate::common::AppState>();
    *state.is_dialog_open.lock() = true;

    let picked = tauri::async_runtime::spawn_blocking({
        let app = app_handle.clone();
        move || {
            app.dialog()
                .file()
                .add_filter("Ghost archive", &["nar", "zip"])
                .blocking_pick_file()
        }
    })
    .await
    .map_err(|e| e.to_string())?;

    let state2 = app_handle.state::<crate::common::AppState>();
    *state2.is_dialog_open.lock() = false;

    let Some(fp) = picked else { return Ok(None) };
    let path = fp.into_path().map_err(|e| e.to_string())?;
    install_ghost_archive(path.to_string_lossy().to_string(), app_handle)
        .await
        .map(Some)
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

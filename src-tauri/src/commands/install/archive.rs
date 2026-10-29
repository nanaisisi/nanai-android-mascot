use crate::common::*;
use super::utils::*;

pub fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(
    mut zip: zip::ZipArchive<R>,
    fallback_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<GhostInfo, String> {
    let mut best_install_idx: Option<(usize, usize)> = None;
    let mut best_descript_idx: Option<(usize, usize)> = None;

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

    if ghost_name.is_empty() {
        ghost_name = fallback_name.to_string();
    }

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

    let target_dir = if target_base.join(&alt_safe_name).exists() {
        target_base.join(&alt_safe_name)
    } else {
        target_base.join(&safe_dir_name)
    };

    if !target_dir.exists() {
        std::fs::create_dir_all(&target_dir)
            .map_err(|e| format!("Failed to create destination dir: {}", e))?;
    }

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

    for i in 0..zip.len() {
        let mut entry = zip
            .by_index(i)
            .map_err(|e| format!("Failed to read archive entry #{}: {}", i, e))?;

        let decoded_name = decode_zip_entry_name(entry.name_raw());
        let entry_name = decoded_name.replace('\\', "/");

        let relative_path = if !root_prefix.is_empty() && entry_name.starts_with(&root_prefix) {
            &entry_name[root_prefix.len()..]
        } else {
            &entry_name
        };

        if relative_path.is_empty() {
            continue;
        }

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

    // [delete.txt]: インストール・更新時の指定ファイル自動削除処理（delete.txt の相対パス解析・削除）
    let delete_txt_path = target_dir.join("delete.txt");
    if delete_txt_path.exists()
        && let Ok(del_content) = std::fs::read_to_string(&delete_txt_path)
    {
        for del_line in del_content.lines() {
            let rel = del_line.trim().replace('\\', "/");
            if !rel.is_empty() && !rel.starts_with("//") {
                let to_del = target_dir.join(&rel);
                let norm_del = normalize_path(&to_del);
                if norm_del.starts_with(&target_dir) && to_del.exists() {
                    if to_del.is_dir() {
                        std::fs::remove_dir_all(&to_del).ok();
                    } else {
                        std::fs::remove_file(&to_del).ok();
                    }
                }
            }
        }
    }

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

    // [balloon,バルーン名], [recommended.balloon,バルーン名]:
    let recommended_balloon = meta_map
        .as_ref()
        .and_then(|m| m.get("recommended.balloon").cloned().or_else(|| m.get("balloon").cloned()));
    let recommended_balloon_path = meta_map
        .as_ref()
        .and_then(|m| m.get("recommended.balloon.path").cloned());
    let default_balloon_path = meta_map
        .as_ref()
        .and_then(|m| m.get("default.balloon.path").cloned());

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
        recommended_balloon,
        recommended_balloon_path,
        default_balloon_path,
    })
}

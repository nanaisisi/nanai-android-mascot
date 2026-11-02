use crate::common::*;
use std::path::Path;

/// refresh 設定時に指定ディレクトリ内のファイルを消去（refreshundeletemask に含まれるファイル名は保護）
pub fn perform_refresh_cleanup(target_dir: &Path, undelete_mask: &[String]) {
    if !target_dir.is_dir() {
        return;
    }

    let Ok(entries) = std::fs::read_dir(target_dir) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        let fname = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        let is_protected = undelete_mask
            .iter()
            .any(|mask| mask.eq_ignore_ascii_case(&fname));

        if is_protected {
            continue;
        }

        if path.is_dir() {
            // ディレクトリ全体を走査して保護対象が含まれていなければ削除、含まれていれば再帰処理
            let contains_protected = undelete_mask.iter().any(|mask| {
                walkdir::WalkDir::new(&path)
                    .into_iter()
                    .filter_map(|e| e.ok())
                    .any(|e| {
                        e.file_name()
                            .to_str()
                            .is_some_and(|name| name.eq_ignore_ascii_case(mask))
                    })
            });

            if contains_protected {
                perform_refresh_cleanup(&path, undelete_mask);
            } else {
                std::fs::remove_dir_all(&path).ok();
            }
        } else {
            std::fs::remove_file(&path).ok();
        }
    }
}

pub fn process_delete_txt(target_dir: &Path) {
    let delete_txt_path = target_dir.join("delete.txt");
    if delete_txt_path.exists()
        && let Ok(del_content) = std::fs::read_to_string(&delete_txt_path)
    {
        for del_line in del_content.lines() {
            let rel = del_line.trim().replace('\\', "/");
            if !rel.is_empty() && !rel.starts_with("//") {
                let to_del = target_dir.join(&rel);
                let norm_del = normalize_path(&to_del);
                if norm_del.starts_with(target_dir) && to_del.exists() {
                    if to_del.is_dir() {
                        std::fs::remove_dir_all(&to_del).ok();
                    } else {
                        std::fs::remove_file(&to_del).ok();
                    }
                }
            }
        }
    }
}

pub fn build_extracted_ghost_info(target_dir: &Path, safe_dir_name: &str) -> GhostInfo {
    let shells = crate::ghost::scan::scan_shells_from_ghost(target_dir);
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
        .unwrap_or_else(|| safe_dir_name.to_string());
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

    let recommended_balloon = meta_map.as_ref().and_then(|m| {
        m.get("recommended.balloon")
            .cloned()
            .or_else(|| m.get("balloon").cloned())
    });
    let recommended_balloon_path = meta_map
        .as_ref()
        .and_then(|m| m.get("recommended.balloon.path").cloned());
    let default_balloon_path = meta_map
        .as_ref()
        .and_then(|m| m.get("default.balloon.path").cloned());

    let (install_date, update_date) = crate::ghost::scan::compute_ghost_dates(target_dir);

    GhostInfo {
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
        ..Default::default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_perform_refresh_cleanup_with_mask() {
        let temp_dir = std::env::temp_dir().join("nanai_test_refresh_cleanup");
        let _ = std::fs::remove_dir_all(&temp_dir);
        std::fs::create_dir_all(&temp_dir).unwrap();

        std::fs::write(temp_dir.join("to_delete.txt"), "delete me").unwrap();
        std::fs::write(temp_dir.join("save.dat"), "preserve me").unwrap();

        let sub_dir = temp_dir.join("sub");
        std::fs::create_dir_all(&sub_dir).unwrap();
        std::fs::write(sub_dir.join("sub_del.txt"), "delete me").unwrap();
        std::fs::write(sub_dir.join("config.ini"), "preserve me too").unwrap();

        let undelete_mask = vec!["save.dat".to_string(), "config.ini".to_string()];
        perform_refresh_cleanup(&temp_dir, &undelete_mask);

        assert!(!temp_dir.join("to_delete.txt").exists());
        assert!(temp_dir.join("save.dat").exists());
        assert!(!sub_dir.join("sub_del.txt").exists());
        assert!(sub_dir.join("config.ini").exists());

        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}

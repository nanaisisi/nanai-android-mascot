use crate::common::*;
use std::path::Path;

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

pub fn build_extracted_ghost_info(
    target_dir: &Path,
    safe_dir_name: &str,
) -> GhostInfo {
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
    }
}

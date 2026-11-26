use super::info::{balloon_descript_map, resolve_balloon_dir};
use crate::common::paths::resolve_vfs_path;
use std::collections::BTreeMap;
use std::path::Path;

#[tauri::command]
pub fn balloon_manifest(
    name: String,
    scope_id: Option<i32>,
    #[allow(non_snake_case)] scopeId: Option<i32>,
    surface_id: Option<i32>,
    #[allow(non_snake_case)] surfaceId: Option<i32>,
    balloon_id: Option<i32>,
    #[allow(non_snake_case)] balloonId: Option<i32>,
    is_input_box: Option<bool>,
    #[allow(non_snake_case)] isInputBox: Option<bool>,
    app_handle: tauri::AppHandle,
) -> Result<BTreeMap<String, String>, String> {
    let s_id = scope_id.or(scopeId);
    let surf_id = surface_id.or(surfaceId);
    let b_id = balloon_id.or(balloonId);
    let input_box = is_input_box.or(isInputBox).unwrap_or(false);
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    let mut map = balloon_descript_map(&dir);
    merge_balloon_option_files(&dir, s_id, surf_id, b_id, input_box, &mut map);
    Ok(map)
}

pub fn resolve_balloon_option_candidates(
    scope_id: Option<i32>,
    surface_id: Option<i32>,
    balloon_id: Option<i32>,
    is_input_box: bool,
) -> Vec<String> {
    let mut candidates = Vec::new();
    if is_input_box {
        if let Some(b) = balloon_id {
            candidates.push(format!("balloonc{}s.txt", b));
        }
        candidates.push("balloonc0s.txt".to_string());
        candidates.push("ballooncs.txt".to_string());
        return candidates;
    }

    if let Some(sid) = scope_id {
        if sid >= 2 {
            if let Some(b) = balloon_id {
                candidates.push(format!("balloonp{}def{}s.txt", sid, b));
                candidates.push(format!("balloonpdef{}s.txt", b));
            }
            candidates.push(format!("balloonp{}def0s.txt", sid));
            candidates.push(format!("balloonp{}defs.txt", sid));
            candidates.push("balloonpdef0s.txt".to_string());
            candidates.push("balloonpdefs.txt".to_string());
            for prefix in ["balloonk", "balloons"] {
                if let Some(b) = balloon_id {
                    candidates.push(format!("{}{}s.txt", prefix, b));
                }
                candidates.push(format!("{}0s.txt", prefix));
                candidates.push(format!("{}s.txt", prefix));
            }
        } else {
            let prefix = if sid == 1 { "balloonk" } else { "balloons" };
            if let Some(surf) = surface_id {
                candidates.push(format!("{}{}{}s.txt", prefix, surf, sid));
            }
            if let Some(b) = balloon_id {
                if b == 2 {
                    candidates.push(format!("{}2s.txt", prefix));
                    candidates.push(format!("{}ss.txt", prefix));
                } else {
                    candidates.push(format!("{}{}s.txt", prefix, b));
                }
            }
            candidates.push(format!("{}0s.txt", prefix));
            candidates.push(format!("{}s.txt", prefix));
            candidates.push(format!("{}.txt", prefix));
        }
    } else if let Some(b) = balloon_id {
        let prefix = "balloons";
        if b == 2 {
            candidates.push(format!("{}2s.txt", prefix));
            candidates.push(format!("{}ss.txt", prefix));
        } else {
            candidates.push(format!("{}{}s.txt", prefix, b));
        }
        candidates.push(format!("{}s.txt", prefix));
    }

    candidates
}

pub fn merge_balloon_option_files(
    dir: &Path,
    scope_id: Option<i32>,
    surface_id: Option<i32>,
    balloon_id: Option<i32>,
    is_input_box: bool,
    map: &mut BTreeMap<String, String>,
) {
    let base_option_files = [
        "balloons.txt",
        "balloonk.txt",
        "balloons0s.txt",
        "balloonk0s.txt",
        "balloonss.txt",
        "balloonks.txt",
    ];
    for opt_file in base_option_files {
        let p = dir.join(opt_file);
        if p.is_file()
            && let Some(sub_map) = resolve_vfs_path(dir, opt_file)
                .and_then(|fp| crate::ghost::scan::read_descript_file(Path::new(&fp)))
        {
            for (k, v) in sub_map {
                map.entry(k).or_insert(v);
            }
        }
    }

    let candidates =
        resolve_balloon_option_candidates(scope_id, surface_id, balloon_id, is_input_box);
    for cand in candidates {
        let p = dir.join(&cand);
        if p.is_file()
            && let Some(sub_map) = resolve_vfs_path(dir, &cand)
                .and_then(|fp| crate::ghost::scan::read_descript_file(Path::new(&fp)))
        {
            for (k, v) in sub_map {
                map.insert(k, v);
            }
            break;
        }
    }
}

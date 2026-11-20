mod extraction;
mod inspection;
mod packaging;
mod postprocess;

pub use extraction::extract_cab_archive;
pub use packaging::create_nar_from_directory;
pub use postprocess::{perform_refresh_cleanup, process_delete_txt};

use super::utils::flatten_balloon_directory;
use crate::commands::install::resolve_asset_path;
use crate::common::models::GhostInfo;
use extraction::extract_zip_entries;
use inspection::inspect_zip_archive;
use postprocess::build_extracted_ghost_info;

pub fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(
    mut zip: zip::ZipArchive<R>,
    fallback_name: &str,
    app_handle: &tauri::AppHandle,
    password: Option<&str>,
) -> Result<GhostInfo, String> {
    let inspection = inspect_zip_archive(&mut zip, fallback_name, app_handle)?;

    if inspection.kind() == "package"
        && let Some(info) = try_extract_multi_package(&mut zip, &inspection, app_handle, password)?
    {
        return Ok(info);
    }

    let target_base = resolve_asset_path(inspection.target_base_path(), app_handle)?;
    let target_dir = match inspection.kind() {
        "shell" => {
            let ghosts_base = resolve_asset_path("ghost", app_handle)?;
            let matched_ghost =
                resolve_target_ghost_dir(&ghosts_base, inspection.accept()).unwrap_or(target_base);
            let shell_base = matched_ghost.join("shell");
            if shell_base.join(inspection.alt_safe_name()).exists() {
                shell_base.join(inspection.alt_safe_name())
            } else {
                shell_base.join(inspection.safe_dir_name())
            }
        }
        "supplement" => {
            let ghosts_base = resolve_asset_path("ghost", app_handle)?;
            resolve_target_ghost_dir(&ghosts_base, inspection.accept()).unwrap_or(target_base)
        }
        _ => {
            if target_base.join(inspection.alt_safe_name()).exists() {
                target_base.join(inspection.alt_safe_name())
            } else {
                target_base.join(inspection.safe_dir_name())
            }
        }
    };

    if !target_dir.exists() {
        std::fs::create_dir_all(&target_dir)
            .map_err(|e| format!("Failed to create destination dir: {}", e))?;
    }

    // refresh 指定時のディレクトリクリーンアップ（メインターゲット）
    if inspection.refresh() {
        println!(
            "🧹 Performing refresh cleanup on target_dir: {:?} (masks: {:?})",
            target_dir,
            inspection.refresh_undelete_mask()
        );
        perform_refresh_cleanup(&target_dir, inspection.refresh_undelete_mask());
    }

    // 同梱リソース側の refresh クリーンアップ
    for res_target in inspection.bundled_resources() {
        if res_target.refresh() && res_target.destination_dir().exists() {
            println!(
                "🧹 Performing refresh cleanup on bundled resource dir: {:?} (masks: {:?})",
                res_target.destination_dir(),
                res_target.refresh_undelete_mask()
            );
            perform_refresh_cleanup(
                res_target.destination_dir(),
                res_target.refresh_undelete_mask(),
            );
        }
    }

    extract_zip_entries(
        &mut zip,
        inspection.root_prefix(),
        &target_dir,
        inspection.bundled_resources(),
        password,
    )?;

    if inspection.kind() == "balloon" {
        flatten_balloon_directory(&target_dir)?;
    }

    println!("✅ Archive successfully installed to: {:?}", target_dir);

    process_delete_txt(&target_dir);

    let info = build_extracted_ghost_info(&target_dir, inspection.safe_dir_name());
    Ok(info)
}

fn try_extract_multi_package<R: std::io::Read + std::io::Seek>(
    zip: &mut zip::ZipArchive<R>,
    inspection: &inspection::InstallInspectionResult,
    app_handle: &tauri::AppHandle,
    password: Option<&str>,
) -> Result<Option<GhostInfo>, String> {
    use super::utils::{decode_zip_entry_name, parse_zip_entry_descript, sanitize_dir_name};

    let root_prefix = inspection.root_prefix();
    let mut sub_installs: Vec<(String, usize)> = Vec::new();

    for i in 0..zip.len() {
        if let Ok(entry) = zip.by_index(i) {
            let name = decode_zip_entry_name(entry.name_raw()).replace('\\', "/");
            let lower = name.to_lowercase();
            if lower.ends_with("/install.txt")
                && let Some(slash_idx) = name.rfind('/')
            {
                let sub_prefix = &name[..=slash_idx];
                if sub_prefix.starts_with(root_prefix) && sub_prefix != root_prefix {
                    sub_installs.push((sub_prefix.to_string(), i));
                }
            }
        }
    }

    if sub_installs.is_empty() {
        return Ok(None);
    }

    let mut primary_dir: Option<std::path::PathBuf> = None;
    let mut primary_name = inspection.safe_dir_name().to_string();

    for (sub_prefix, idx) in sub_installs {
        let map = if let Ok(mut entry) = zip.by_index(idx) {
            parse_zip_entry_descript(&mut entry)
        } else {
            continue;
        };

        let sub_name = map
            .get("name")
            .cloned()
            .unwrap_or_else(|| inspection.ghost_name().to_string());
        let sub_kind = inspection::normalize_install_kind(map.get("type").map(|s| s.as_str()));
        let raw_dir = map
            .get("directory")
            .filter(|s| !s.trim().is_empty())
            .map(|s| s.as_str())
            .unwrap_or(&sub_name);
        let safe_dir = sanitize_dir_name(raw_dir);
        let alt_safe = sanitize_dir_name(&sub_name);
        let accept = map.get("accept").map(|s| s.as_str());
        let refresh = map.get("refresh").is_some_and(|v| v.trim() == "1");
        let masks: Vec<String> = map
            .get("refreshundeletemask")
            .map(|v| {
                v.split(':')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect()
            })
            .unwrap_or_default();

        let base_str = match sub_kind.as_str() {
            "balloon" => "assets/balloon",
            "shell" => "assets/shell",
            "plugin" => "assets/plugin",
            "headline" => "assets/headline",
            _ => "assets/ghost",
        };
        let target_base = resolve_asset_path(base_str, app_handle)?;
        let target_dir = match sub_kind.as_str() {
            "shell" => {
                let ghosts_base = resolve_asset_path("ghost", app_handle)?;
                let matched = resolve_target_ghost_dir(&ghosts_base, accept).unwrap_or(target_base);
                let shell_base = matched.join("shell");
                if shell_base.join(&alt_safe).exists() {
                    shell_base.join(&alt_safe)
                } else {
                    shell_base.join(&safe_dir)
                }
            }
            "supplement" => {
                let ghosts_base = resolve_asset_path("ghost", app_handle)?;
                resolve_target_ghost_dir(&ghosts_base, accept).unwrap_or(target_base)
            }
            _ => {
                if target_base.join(&alt_safe).exists() {
                    target_base.join(&alt_safe)
                } else {
                    target_base.join(&safe_dir)
                }
            }
        };

        if !target_dir.exists() {
            std::fs::create_dir_all(&target_dir)
                .map_err(|e| format!("Failed to create destination dir: {}", e))?;
        }
        if refresh {
            perform_refresh_cleanup(&target_dir, &masks);
        }

        extract_zip_entries(zip, &sub_prefix, &target_dir, &[], password)?;
        if sub_kind == "balloon" {
            flatten_balloon_directory(&target_dir)?;
        }
        process_delete_txt(&target_dir);

        if primary_dir.is_none() || sub_kind == "ghost" {
            primary_dir = Some(target_dir);
            primary_name = safe_dir;
        }
    }

    let final_dir = primary_dir.ok_or_else(|| "No sub-packages extracted".to_string())?;
    Ok(Some(build_extracted_ghost_info(&final_dir, &primary_name)))
}

fn resolve_target_ghost_dir(
    ghosts_base: &std::path::Path,
    accept: Option<&str>,
) -> Option<std::path::PathBuf> {
    let entries = std::fs::read_dir(ghosts_base).ok()?;
    let dirs: Vec<std::path::PathBuf> = entries
        .filter_map(|e| e.ok().map(|entry| entry.path()))
        .filter(|p| p.is_dir())
        .collect();

    if let Some(accept_name) = accept.map(str::trim).filter(|s| !s.is_empty()) {
        let accept_lower = accept_name.to_lowercase();
        let mut ci_match: Option<std::path::PathBuf> = None;
        let mut dir_match: Option<std::path::PathBuf> = None;

        for dir in &dirs {
            let descript_path = dir.join("ghost").join("master").join("descript.txt");
            if let Some(descript) = crate::ghost::scan::read_descript_file(&descript_path) {
                for key in ["name", "sakura.name"] {
                    if let Some(val) = descript.get(key) {
                        if val == accept_name {
                            return Some(dir.clone());
                        }
                        if ci_match.is_none() && val.to_lowercase() == accept_lower {
                            ci_match = Some(dir.clone());
                        }
                    }
                }
            }

            if dir_match.is_none()
                && let Some(dir_name) = dir.file_name().and_then(|n| n.to_str())
                && (dir_name == accept_name || dir_name.to_lowercase() == accept_lower)
            {
                dir_match = Some(dir.clone());
            }
        }

        if let Some(m) = ci_match.or(dir_match) {
            return Some(m);
        }
    }

    if dirs.len() == 1 {
        return Some(dirs[0].clone());
    }

    None
}

#[cfg(test)]
mod tests {
    use super::resolve_target_ghost_dir;
    use std::fs;

    #[test]
    fn test_resolve_target_ghost_dir_by_accept_and_fallback() {
        let temp_dir = std::env::temp_dir().join("nanai_test_resolve_target_ghost_dir");
        let _ = fs::remove_dir_all(&temp_dir);
        let ghost_a = temp_dir.join("ghost_a");
        let ghost_b = temp_dir.join("ghost_b");
        fs::create_dir_all(ghost_a.join("ghost").join("master")).unwrap();
        fs::create_dir_all(ghost_b.join("ghost").join("master")).unwrap();

        fs::write(
            ghost_a.join("ghost").join("master").join("descript.txt"),
            "name,AlphaGhost\nsakura.name,Alpha\n",
        )
        .unwrap();
        fs::write(
            ghost_b.join("ghost").join("master").join("descript.txt"),
            "name,BetaGhost\nsakura.name,Beta\n",
        )
        .unwrap();

        // Exact match on name
        assert_eq!(
            resolve_target_ghost_dir(&temp_dir, Some("BetaGhost")),
            Some(ghost_b.clone())
        );
        // Case-insensitive match on sakura.name
        assert_eq!(
            resolve_target_ghost_dir(&temp_dir, Some("alpha")),
            Some(ghost_a.clone())
        );
        // Directory name fallback
        assert_eq!(
            resolve_target_ghost_dir(&temp_dir, Some("ghost_b")),
            Some(ghost_b.clone())
        );
        // Multiple ghosts with no match -> None
        assert_eq!(resolve_target_ghost_dir(&temp_dir, Some("Unknown")), None);

        // Single ghost fallback when no match / no accept
        fs::remove_dir_all(&ghost_b).unwrap();
        assert_eq!(
            resolve_target_ghost_dir(&temp_dir, None),
            Some(ghost_a.clone())
        );

        let _ = fs::remove_dir_all(&temp_dir);
    }
}

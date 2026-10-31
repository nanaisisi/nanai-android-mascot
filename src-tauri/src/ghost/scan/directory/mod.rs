mod filter;
mod manifest;
mod types;

pub use types::ScanResult;

use super::date::{compute_ghost_dates, format_system_time};
use super::shell::scan_shells_from_ghost;
use crate::common::*;
use filter::{parse_developer_options, should_skip_directory};
use manifest::parse_ghost_manifest;
use tauri::Manager;

#[tauri::command]
pub async fn scan_ghost_directory(
    _state: tauri::State<'_, AppState>,
    ghost_dir: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    let ghost_path = resolve_asset_path(&ghost_dir, &app_handle)?;

    println!("🔍 Input path: {}", ghost_dir);
    println!("🔍 Resolved absolute path: {:?}", ghost_path);

    let mut paths_to_scan = Vec::new();
    if let Ok(app_data_dir) = app_handle.path().app_data_dir() {
        let user_ghost_dir = app_data_dir.join("userData").join("ghost");
        if user_ghost_dir.exists() {
            paths_to_scan.push(user_ghost_dir);
        }
        let alt_user_ghost_dir = app_data_dir.join("ghost");
        if alt_user_ghost_dir.exists() && !paths_to_scan.contains(&alt_user_ghost_dir) {
            paths_to_scan.push(alt_user_ghost_dir);
        }
    }
    if !paths_to_scan.contains(&ghost_path) {
        paths_to_scan.push(ghost_path.clone());
    }

    let mut ghosts = Vec::new();
    let mut scanned_names = std::collections::HashSet::new();

    for scan_dir in paths_to_scan {
        if let Ok(entries) = std::fs::read_dir(&scan_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    let dir_name = entry.file_name().to_string_lossy().to_string();
                    if !dir_name.starts_with('.') {
                        if should_skip_directory(&path) {
                            println!(
                                "🚫 Skipping ghost directory with ignore file: {:?}",
                                path
                            );
                            continue;
                        }

                        parse_developer_options(&path);

                        let manifest = parse_ghost_manifest(&path, &dir_name);

                        if scanned_names.contains(&manifest.display_name) {
                            continue;
                        }
                        scanned_names.insert(manifest.display_name.clone());

                        let (install_date, update_date) = compute_ghost_dates(&path);
                        let dau_path = path.join("updates2.dau");

                        let update_result = if dau_path.exists() {
                            Some("OK(0)".to_string())
                        } else {
                            Some("-".to_string())
                        };

                        let shells = scan_shells_from_ghost(&path);

                        ghosts.push(GhostInfo {
                            name: manifest.display_name,
                            version: manifest.version,
                            path: path.to_string_lossy().to_string(),
                            sakura_name: manifest.sakura_name,
                            kero_name: manifest.kero_name,
                            shiori: manifest.shiori,
                            craftman: manifest.craftman,
                            craftman_url: manifest.craftman_url,
                            shells,
                            group: manifest.group,
                            install_date,
                            update_date,
                            update_result,
                            recommended_balloon: manifest.recommended_balloon,
                            recommended_balloon_path: manifest.recommended_balloon_path,
                            default_balloon_path: manifest.default_balloon_path,
                        });
                    }
                }
            }
        }
    }

    if ghosts.is_empty() {
        let mock_nanai_path = ghost_path.join("mock_nanai");
        if mock_nanai_path.exists() {
            let shells = scan_shells_from_ghost(&mock_nanai_path);
            let (install_date, update_date) = if let Ok(meta) = std::fs::metadata(&mock_nanai_path)
            {
                let modified = meta.modified().ok().and_then(format_system_time);
                let created = meta.created().ok().and_then(format_system_time);
                (created.or(modified.clone()), modified)
            } else {
                (None, None)
            };
            ghosts.push(GhostInfo {
                name: "mock_nanai".to_string(),
                version: Some("1.0.0".to_string()),
                path: mock_nanai_path.to_string_lossy().to_string(),
                sakura_name: Some("なない".to_string()),
                kero_name: None,
                shiori: None,
                craftman: None,
                craftman_url: None,
                shells,
                group: None,
                install_date,
                update_date,
                update_result: Some("OK(0)".to_string()),
                recommended_balloon: Some("default".to_string()),
                recommended_balloon_path: None,
                default_balloon_path: None,
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

use crate::common::*;
use tauri::Manager;
use super::descript::read_descript_file;
use super::shell::scan_shells_from_ghost;
use super::date::{format_system_time, compute_ghost_dates};

#[derive(Debug, Clone, serde::Serialize)]
pub struct ScanResult {
    ghosts: Vec<GhostInfo>,
    resolved_path: String,
    input_path: String,
}

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
                        if path.join(".dev_ignore").exists() {
                            println!("🚫 Skipping ghost directory with .dev_ignore: {:?}", path);
                            continue;
                        }

                        // [descript.txt（Ghostの）]: ゴーストマニフェスト定義読込
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

                        // [name,ゴースト名], [title,表示名], [type,種別]:
                        let display_name = meta_map
                            .as_ref()
                            .and_then(|m| m.get("name").cloned().or_else(|| m.get("title").cloned()))
                            .unwrap_or_else(|| dir_name.clone());

                        if scanned_names.contains(&display_name) {
                            continue;
                        }
                        scanned_names.insert(display_name.clone());

                        // [version,バージョン], [sakura.name,名前], [sakura.name2,名前], [kero.name,名前]:
                        let version = meta_map.as_ref().and_then(|m| m.get("version").cloned());
                        let sakura_name = meta_map
                            .as_ref()
                            .and_then(|m| m.get("sakura.name").cloned().or_else(|| m.get("sakura.name2").cloned()));
                        let kero_name = meta_map
                            .as_ref()
                            .and_then(|m| m.get("kero.name").cloned());

                        // [shiori,ファイル名], [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL], [id,ID名]:
                        let shiori = meta_map.as_ref().and_then(|m| m.get("shiori").cloned());
                        let craftman = meta_map.as_ref().and_then(|m| m.get("craftman").cloned().or_else(|| m.get("craftmanw").cloned()));
                        let craftman_url = meta_map
                            .as_ref()
                            .and_then(|m| m.get("craftmanurl").cloned().or_else(|| m.get("homeurl").cloned()));

                        // [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [icon,ファイル名], [icon.minimize,ファイル名], [install.accept,名前1,名前2,名前3...]:
                        if let Some(m) = &meta_map {
                            let _readme = m.get("readme");
                            let _readme_cs = m.get("readme.charset");
                            let _cs = m.get("charset");
                            let _icon = m.get("icon");
                            let _icon_min = m.get("icon.minimize");
                            let _accept = m.get("install.accept");
                        }

                        // [balloon,バルーン名], [recommended.balloon,バルーン名]:
                        let recommended_balloon = meta_map
                            .as_ref()
                            .and_then(|m| m.get("recommended.balloon").cloned().or_else(|| m.get("balloon").cloned()));

                        // [標準と推奨の使い分け], [recommended.balloon.path,パス]:
                        let recommended_balloon_path = meta_map
                            .as_ref()
                            .and_then(|m| m.get("recommended.balloon.path").cloned());

                        // [default.balloon.path,パス]:
                        let default_balloon_path = meta_map
                            .as_ref()
                            .and_then(|m| m.get("default.balloon.path").cloned());

                        let (install_date, update_date) = compute_ghost_dates(&path);
                        let dau_path = path.join("updates2.dau");

                        let update_result = if dau_path.exists() {
                            Some("OK(0)".to_string())
                        } else {
                            Some("-".to_string())
                        };
                        let group = meta_map.as_ref().and_then(|m| m.get("group").cloned());

                        let shells = scan_shells_from_ghost(&path);

                        ghosts.push(GhostInfo {
                            name: display_name,
                            version,
                            path: path.to_string_lossy().to_string(),
                            sakura_name,
                            kero_name,
                            shiori,
                            craftman,
                            craftman_url,
                            shells,
                            group,
                            install_date,
                            update_date,
                            update_result,
                            recommended_balloon,
                            recommended_balloon_path,
                            default_balloon_path,
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
            let (install_date, update_date) = if let Ok(meta) = std::fs::metadata(&mock_nanai_path) {
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

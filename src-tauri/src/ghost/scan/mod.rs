//! ゴーストディレクトリのスキャン（Tauri コマンド）

use crate::common::*;

mod descript;
mod shell;

pub use self::descript::read_descript_file;
pub use self::shell::scan_shells_from_ghost;

/// ゴーストスキャン結果
#[derive(Debug, Clone, serde::Serialize)]
pub struct ScanResult {
    ghosts: Vec<GhostInfo>,
    resolved_path: String,
    input_path: String,
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

                    // 全シェルをスキャン
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
                version: Some("1.0.0".to_string()),
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

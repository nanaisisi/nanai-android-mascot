use crate::common::*;
use crate::shiori::dynamic::ShioriDynamicEngine;
use nanai_android_mascot_ui::resolve_vfs_path;
use std::path::PathBuf;

/// ゴーストを読み込み（動的SHIORIローダー対応）
#[tauri::command]
pub async fn load_ghost(
    state: tauri::State<'_, AppState>,
    ghost_name: String,
    ghost_path: Option<String>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    println!("📥 Loading ghost: {}", ghost_name);

    if let Some(mut engine) = state.shiori_engine.lock().take() {
        let _ = engine.unload();
    }

    *state.current_ghost_name.lock() = Some(ghost_name.clone());

    let ghost_dir = ghost_path
        .filter(|path| PathBuf::from(path).is_dir())
        .map(PathBuf::from)
        .or_else(|| resolve_ghost_directory(&ghost_name, &app_handle).ok())
        .unwrap_or_else(|| PathBuf::from(format!("assets/ghost/{}", ghost_name)));

    let ghost_master_dir = ghost_dir.join("ghost").join("master");

    let mut candidates = Vec::new();

    let descript_path = ghost_master_dir.join("descript.txt");
    if let Some(map) = crate::ghost::scan::read_descript_file(&descript_path)
        && let Some(shiori_filename) = map.get("shiori")
    {
        let rel_path = shiori_filename.trim();
        if !rel_path.is_empty() {
            candidates.push(ghost_master_dir.join(rel_path));
            #[cfg(not(windows))]
            {
                if rel_path.ends_with(".dll") {
                    let so_name = format!("{}.so", &rel_path[..rel_path.len() - 4]);
                    candidates.push(ghost_master_dir.join(&so_name));
                    candidates.push(ghost_master_dir.join(format!("lib{}", so_name)));
                }
            }
        }
    }

    #[cfg(windows)]
    {
        candidates.push(ghost_master_dir.join("yaya.dll"));
        candidates.push(ghost_master_dir.join("satori.dll"));
        candidates.push(ghost_master_dir.join("kawari.dll"));
        candidates.push(ghost_master_dir.join("shiori.dll"));
        candidates.push(ghost_master_dir.join("satoriya.dll"));
        candidates.push(ghost_master_dir.join("aya5.dll"));
        candidates.push(ghost_master_dir.join("aya.dll"));
    }
    #[cfg(not(windows))]
    {
        candidates.push(ghost_master_dir.join("yaya.so"));
        candidates.push(ghost_master_dir.join("libyaya.so"));
        candidates.push(ghost_master_dir.join("satori.so"));
        candidates.push(ghost_master_dir.join("libsatori.so"));
        candidates.push(ghost_master_dir.join("kawari.so"));
        candidates.push(ghost_master_dir.join("libkawari.so"));
        candidates.push(ghost_master_dir.join("shiori.so"));
        candidates.push(ghost_master_dir.join("libshiori.so"));
    }

    let mut loaded = false;
    for cand in candidates {
        let target_cand: Option<PathBuf> = if cand.exists() {
            Some(cand)
        } else if let Some(parent) = cand.parent()
            && parent.exists()
            && let Some(file_name) = cand.file_name().and_then(|n| n.to_str())
        {
            resolve_vfs_path(parent, file_name)
        } else {
            None
        };

        if let Some(cand_path) = target_cand {
            println!("🔍 Attempting to load SHIORI binary: {:?}", cand_path);
            match ShioriDynamicEngine::load_library(&cand_path) {
                Ok(mut engine) => {
                    if let Err(e) = engine.initialize(&ghost_master_dir) {
                        eprintln!("⚠️ Failed to initialize SHIORI at {:?}: {}", cand_path, e);
                    } else {
                        *state.shiori_engine.lock() = Some(engine);
                        state
                            .active_ghosts
                            .lock()
                            .insert("main".to_string(), ghost_name.clone());
                        loaded = true;
                        println!("🎉 Native SHIORI activated: {:?}", cand_path);
                        break;
                    }
                }
                Err(e) => {
                    eprintln!("⚠️ Failed to load library {:?}: {}", cand_path, e);
                }
            }
        }
    }

    if loaded {
        Ok(format!("Ghost '{}' loaded with native SHIORI", ghost_name))
    } else {
        println!(
            "ℹ️ No native SHIORI library found or loaded; fallback mode enabled for '{}'",
            ghost_name
        );
        Ok(format!("Ghost '{}' loaded (fallback mode)", ghost_name))
    }
}

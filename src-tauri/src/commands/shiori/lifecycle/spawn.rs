use crate::common::*;
use crate::shiori::dynamic::ShioriDynamicEngine;
use std::path::PathBuf;

/// ゴーストを新規インスタンスとして追加起動 (マルチゴースト)
#[tauri::command]
pub async fn spawn_ghost(
    state: tauri::State<'_, AppState>,
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    println!("👥 Spawning new ghost instance: {}", ghost_name);
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let instance_id = format!("ghost_{}", now);

    let ghost_dir = resolve_ghost_directory(&ghost_name, &app_handle)
        .unwrap_or_else(|_| PathBuf::from(format!("assets/ghost/{}", ghost_name)));
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

    for cand in candidates {
        if cand.exists()
            && let Ok(mut engine) = ShioriDynamicEngine::load_library(&cand)
            && engine.initialize(&ghost_master_dir).is_ok()
        {
            state
                .ghost_engines
                .lock()
                .insert(instance_id.clone(), engine);
            break;
        }
    }

    state
        .active_ghosts
        .lock()
        .insert(instance_id.clone(), ghost_name.clone());

    #[cfg(desktop)]
    {
        let encoded_name: String = ghost_name
            .bytes()
            .map(|b| {
                if b.is_ascii_alphanumeric() || b == b'-' || b == b'_' || b == b'.' || b == b'~' {
                    (b as char).to_string()
                } else {
                    format!("%{:02X}", b)
                }
            })
            .collect();
        let url = format!(
            "index.html?ghost_id={}&ghost_name={}",
            instance_id, encoded_name
        );
        let win_label = format!("window_{}", instance_id);

        let builder = tauri::WebviewWindowBuilder::new(
            &app_handle,
            &win_label,
            tauri::WebviewUrl::App(url.into()),
        )
        .title(format!("Nanai Android Mascot - {}", ghost_name))
        .inner_size(400.0, 600.0)
        .transparent(true)
        .decorations(false)
        .shadow(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(true);

        builder.build().map_err(|e| e.to_string())?;
    }

    Ok(instance_id)
}

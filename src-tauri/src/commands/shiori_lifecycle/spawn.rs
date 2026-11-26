use super::resolve_and_load_shiori_engine;
use crate::common::paths::resolve_ghost_directory;
use crate::common::state::AppState;
use std::path::PathBuf;

/// ゴーストを新規インスタンスとして追加起動 (マルチゴースト)
#[tauri::command]
pub(crate) async fn spawn_ghost(
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

    if let Ok((engine, _)) = resolve_and_load_shiori_engine(&ghost_master_dir) {
        state
            .ghost_engines
            .lock()
            .insert(instance_id.clone(), engine);
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

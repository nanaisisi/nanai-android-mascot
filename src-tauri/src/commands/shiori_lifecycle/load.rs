use super::resolve_and_load_shiori_engine;
use crate::common::paths::resolve_ghost_directory;
use crate::common::state::AppState;
use std::path::PathBuf;

/// ゴーストを読み込み（動的SHIORIローダー＋Android向け静的/フォールバック接続対応）
#[tauri::command]
pub(crate) async fn load_ghost(
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

    let manifest =
        crate::ghost::scan::directory::manifest::parse_ghost_manifest(&ghost_dir, &ghost_name);
    *state.num_characters.lock() = manifest.num_characters();

    let ghost_master_dir = ghost_dir.join("ghost").join("master");
    let (engine, is_native_dynamic) = resolve_and_load_shiori_engine(&ghost_master_dir)?;
    *state.shiori_engine.lock() = Some(engine);
    state
        .active_ghosts
        .lock()
        .insert("main".to_string(), ghost_name.clone());

    #[cfg(not(target_os = "android"))]
    {
        let _ = crate::tray::update_tray_for_ghost(&app_handle, &ghost_name, &ghost_master_dir);
    }

    if is_native_dynamic {
        Ok(format!("Ghost '{}' loaded with native SHIORI", ghost_name))
    } else {
        Ok(format!(
            "Ghost '{}' loaded with static/fallback SHIORI",
            ghost_name
        ))
    }
}

/// ゴーストの SHIORI を再読み込み (`\![reload,shiori]` 対応)
#[tauri::command]
pub(crate) async fn reload_current_ghost_shiori(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let current_name = state.current_ghost_name.lock().clone();
    if let Some(ghost_name) = current_name {
        println!("🔄 Reloading SHIORI for ghost: {}", ghost_name);
        load_ghost(state, ghost_name, None, app_handle).await
    } else {
        Err("No active ghost loaded to reload SHIORI".to_string())
    }
}

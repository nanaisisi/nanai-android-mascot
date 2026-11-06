use crate::common::state::AppState;
use nanai_android_mascot_ui::ShioriEngine;

/// 単一ゴーストを終了 (SSP準拠: そのゴーストのみ終了。残りが無ければプロセス終了)
#[tauri::command]
pub async fn close_ghost(
    state: tauri::State<'_, AppState>,
    ghost_id: Option<String>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let target_id = ghost_id.unwrap_or_else(|| "main".to_string());
    println!("❌ Closing ghost instance: {}", target_id);

    if let Some(mut engine) = state.ghost_engines.lock().remove(&target_id) {
        let _ = engine.unload();
    }
    if target_id == "main"
        && let Some(mut engine) = state.shiori_engine.lock().take()
    {
        let _ = engine.unload();
    }

    let mut active = state.active_ghosts.lock();
    active.remove(&target_id);
    let remaining_count = active.len();
    drop(active);

    if remaining_count == 0 {
        #[cfg(not(target_os = "android"))]
        {
            let _ = crate::tray::reset_tray_to_default(&app_handle);
        }
        println!("🚪 すべてのゴーストが終了したためアプリケーションを終了します");
        let _ = app_handle.exit(0);
    }

    Ok(())
}

/// 現在のゴーストのSHIORIをアンロード
#[tauri::command]
pub async fn unload_current_ghost(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    if let Some(mut engine) = state.shiori_engine.lock().take() {
        let _ = engine.unload();
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = crate::tray::reset_tray_to_default(&app_handle);
    }
    Ok(())
}

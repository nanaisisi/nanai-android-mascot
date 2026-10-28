use crate::common::*;

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

    #[cfg(desktop)]
    {
        use tauri::Manager;
        let win_label = if target_id == "main" {
            "main".to_string()
        } else {
            format!("window_{}", target_id)
        };
        if let Some(win) = app_handle.get_webview_window(&win_label) {
            let _ = win.close();
        }
    }

    if remaining_count == 0 {
        println!("🏁 No active ghosts remaining. Exiting app.");
        app_handle.exit(0);
    }

    Ok(())
}

/// 現在のゴーストを終了
#[tauri::command]
pub async fn unload_current_ghost(state: tauri::State<'_, AppState>) -> Result<String, String> {
    if let Some(mut engine) = state.shiori_engine.lock().take() {
        let _ = engine.unload();
    }
    *state.current_ghost_name.lock() = None;
    Ok("Ghost unloaded successfully".to_string())
}

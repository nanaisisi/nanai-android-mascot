use crate::common::models::GhostInfo;
use crate::common::state::AppState;
use crate::ghost::scan::{ScanResult, scan_ghost_directory};

/// 現在のゴースト情報を取得
#[tauri::command]
pub(crate) async fn get_current_ghost(
    state: tauri::State<'_, AppState>,
) -> Result<Option<GhostInfo>, String> {
    let name = state.current_ghost_name().lock().clone();
    Ok(name.map(|name| GhostInfo {
        name,
        ..Default::default()
    }))
}

/// すべてのゴースト情報を取得（簡易版）
#[tauri::command]
pub(crate) async fn get_all_ghosts(
    _state: tauri::State<'_, AppState>,
) -> Result<Vec<GhostInfo>, String> {
    // 実際のスキャン結果のみを返す（空の場合は空配列）
    Ok(vec![])
}

/// SHIORIの状態を取得
#[tauri::command]
#[specta::specta]
pub(crate) async fn get_shiori_status(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    Ok(state.shiori_engine.lock().is_some())
}

/// 簡易ゴーストスキャン（JavaScriptから呼び出し用）
#[tauri::command]
pub(crate) async fn scan_ghosts(
    state: tauri::State<'_, AppState>,
    ghost_path: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    // ghost_pathをghost_dirとしてscan_ghost_directoryに渡す
    scan_ghost_directory(state, ghost_path, app_handle).await
}

use crate::common::*;
use crate::ghost::scan::{ScanResult, scan_ghost_directory};

/// 現在のゴースト情報を取得（簡易版）
#[tauri::command]
pub async fn get_current_ghost(
    _state: tauri::State<'_, AppState>,
) -> Result<Option<GhostInfo>, String> {
    // 実際にはゴーストが選択されていない場合はNoneを返す
    Ok(None)
}

/// すべてのゴースト情報を取得（簡易版）
#[tauri::command]
pub async fn get_all_ghosts(_state: tauri::State<'_, AppState>) -> Result<Vec<GhostInfo>, String> {
    // 実際のスキャン結果のみを返す（空の場合は空配列）
    Ok(vec![])
}

/// SHIORIの状態を取得
#[tauri::command]
pub async fn get_shiori_status(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    Ok(state.shiori_engine.lock().is_some())
}

/// 簡易ゴーストスキャン（JavaScriptから呼び出し用）
#[tauri::command]
pub async fn scan_ghosts(
    state: tauri::State<'_, AppState>,
    ghost_path: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    // ghost_pathをghost_dirとしてscan_ghost_directoryに渡す
    scan_ghost_directory(state, ghost_path, app_handle).await
}

//! FMO (File Mapping Object) 共有状態管理 (UKADOC 規格準拠)
//! 起動中ゴーストの状態（サーフィス、名前、バルーンテキスト等）を外部ツールや他プロセスへ公開するインターフェース

use crate::common::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FmoGhostStatus {
    pub name: String,
    pub surface0: u32,
    pub surface1: u32,
    pub balloon0: String,
    pub balloon1: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FmoSystemStatus {
    pub ghosts: HashMap<String, FmoGhostStatus>,
    pub hwnd: u64,
    pub craftman: String,
}

/// 現在の FMO 状態を取得する Tauri コマンド (UKADOC FMO 規格準拠)
#[tauri::command]
pub async fn get_fmo_status(
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let current_name = state
        .current_ghost_name
        .lock()
        .clone()
        .unwrap_or_else(|| "Nanai".to_string());

    let mut ghosts = HashMap::new();
    ghosts.insert(
        "0".to_string(),
        FmoGhostStatus {
            name: current_name,
            surface0: 0,
            surface1: 10,
            balloon0: "".to_string(),
            balloon1: "".to_string(),
            path: "".to_string(),
        },
    );

    let fmo = FmoSystemStatus {
        ghosts,
        hwnd: 0,
        craftman: "Nanai Project".to_string(),
    };

    serde_json::to_string(&fmo).map_err(|e| e.to_string())
}

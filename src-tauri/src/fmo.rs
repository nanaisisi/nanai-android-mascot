//! FMO (File Mapping Object) 共有状態管理 (UKADOC 規格準拠)
//! 起動中ゴーストの状態（サーフィス、名前、バルーンテキスト等）を外部ツールや他プロセスへ公開するインターフェース

use crate::common::*;
pub use nanai_android_mascot_ui::fmo::FmoEntry;
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
pub async fn get_fmo_status(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let current_name = state
        .current_ghost_name
        .lock()
        .clone()
        .unwrap_or_else(|| "Nanai".to_string());

    let entry = FmoEntry {
        id: "0".to_string(),
        name: current_name.clone(),
        keroname: String::new(),
        hwnd: 0,
        sakura_surface: 0,
        kero_surface: 10,
        ghostpath: String::new(),
        balloon0: String::new(),
        balloon1: String::new(),
    };

    let mut ghosts = HashMap::new();
    ghosts.insert(
        entry.id,
        FmoGhostStatus {
            name: entry.name,
            surface0: entry.sakura_surface as u32,
            surface1: entry.kero_surface as u32,
            balloon0: entry.balloon0,
            balloon1: entry.balloon1,
            path: entry.ghostpath,
        },
    );

    let fmo = FmoSystemStatus {
        ghosts,
        hwnd: 0,
        craftman: "Nanai Project".to_string(),
    };

    serde_json::to_string(&fmo).map_err(|e| e.to_string())
}

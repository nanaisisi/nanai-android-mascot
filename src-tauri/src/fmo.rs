//! FMO (File Mapping Object) 共有状態管理 (UKADOC 規格準拠)
//! 起動中ゴーストの状態（サーフィス、名前、バルーンテキスト等）を外部ツールや他プロセスへ公開するインターフェース
//! モバイルライフサイクル（バックグラウンド/フォアグラウンド）状態の同期に対応

use crate::common::*;
pub use nanai_android_mascot_ui::fmo::FmoEntry;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FmoGhostStatus {
    pub name: String,
    #[serde(default)]
    pub keroname: String,
    pub surface0: u32,
    pub surface1: u32,
    pub balloon0: String,
    pub balloon1: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kerohwnd: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modulestate: Option<String>,
    pub path: String,
    #[serde(default = "default_true")]
    pub is_visible: bool,
    #[serde(default = "default_active")]
    pub lifecycle_state: String,
}

fn default_true() -> bool {
    true
}

fn default_active() -> String {
    "active".to_string()
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

    let mut entry = FmoEntry::new("0", current_name);
    entry.keroname = "Kero".to_string();
    entry.modulestate = Some("shiori:running".to_string());
    entry.update_lifecycle("active", true);

    let mut ghosts = HashMap::new();
    ghosts.insert(
        entry.id.clone(),
        FmoGhostStatus {
            name: entry.name,
            keroname: entry.keroname,
            surface0: entry.sakura_surface as u32,
            surface1: entry.kero_surface as u32,
            balloon0: entry.balloon0,
            balloon1: entry.balloon1,
            kerohwnd: entry.kerohwnd,
            modulestate: entry.modulestate,
            path: entry.ghostpath,
            is_visible: entry.is_visible,
            lifecycle_state: entry.lifecycle_state,
        },
    );

    let fmo = FmoSystemStatus {
        ghosts,
        hwnd: 0,
        craftman: "Nanai Project".to_string(),
    };

    serde_json::to_string(&fmo).map_err(|e| e.to_string())
}

/// モバイルライフサイクル変更時の FMO 状態更新 Tauri コマンド
#[tauri::command]
pub async fn update_fmo_lifecycle_state(
    lifecycle_state: String,
    is_visible: bool,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let current_name = state
        .current_ghost_name
        .lock()
        .clone()
        .unwrap_or_else(|| "Nanai".to_string());

    let mut entry = FmoEntry::new("0", current_name);
    entry.keroname = "Kero".to_string();
    entry.modulestate = Some("shiori:running".to_string());
    entry.update_lifecycle(&lifecycle_state, is_visible);

    let mut ghosts = HashMap::new();
    ghosts.insert(
        entry.id.clone(),
        FmoGhostStatus {
            name: entry.name,
            keroname: entry.keroname,
            surface0: entry.sakura_surface as u32,
            surface1: entry.kero_surface as u32,
            balloon0: entry.balloon0,
            balloon1: entry.balloon1,
            kerohwnd: entry.kerohwnd,
            modulestate: entry.modulestate,
            path: entry.ghostpath,
            is_visible: entry.is_visible,
            lifecycle_state: entry.lifecycle_state,
        },
    );

    let fmo = FmoSystemStatus {
        ghosts,
        hwnd: 0,
        craftman: "Nanai Project".to_string(),
    };

    serde_json::to_string(&fmo).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fmo_ghost_status_serialization() {
        let status = FmoGhostStatus {
            name: "Nanai".to_string(),
            keroname: "Kero".to_string(),
            surface0: 0,
            surface1: 10,
            balloon0: "".to_string(),
            balloon1: "".to_string(),
            kerohwnd: None,
            modulestate: Some("shiori:running,lifecycle:active".to_string()),
            path: "".to_string(),
            is_visible: true,
            lifecycle_state: "active".to_string(),
        };

        let json = serde_json::to_string(&status).unwrap();
        assert!(json.contains("\"lifecycle_state\":\"active\""));
        assert!(json.contains("\"is_visible\":true"));
    }
}

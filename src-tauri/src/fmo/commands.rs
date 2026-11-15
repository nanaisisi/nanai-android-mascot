//! FMO 状態取得・同期更新用 Tauri コマンド

use super::types::{FmoGhostStatus, FmoSystemStatus};
use crate::common::state::AppState;
pub use crate::ui_adapter::fmo::FmoEntry;
use std::collections::HashMap;

/// 現在の FMO 状態を取得する Tauri コマンド (UKADOC FMO 規格準拠)
#[tauri::command]
pub async fn get_fmo_status(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let current_name = state
        .current_ghost_name
        .lock()
        .clone()
        .unwrap_or_else(|| "Nanai".to_string());

    let mut entry = FmoEntry::new("0", current_name)
        .with_keroname("Kero")
        .with_modulestate("shiori:running");
    entry.update_lifecycle("active", true);

    let mut ghosts = HashMap::new();
    ghosts.insert(
        entry.id().to_string(),
        FmoGhostStatus {
            name: entry.name().to_string(),
            keroname: entry.keroname().to_string(),
            surface0: entry.sakura_surface() as u32,
            surface1: entry.kero_surface() as u32,
            balloon0: entry.balloon0().to_string(),
            balloon1: entry.balloon1().to_string(),
            kerohwnd: entry.kerohwnd(),
            modulestate: entry.modulestate().map(ToString::to_string),
            path: entry.ghostpath().to_string(),
            is_visible: entry.is_visible(),
            lifecycle_state: entry.lifecycle_state().to_string(),
        },
    );

    let fmo = FmoSystemStatus {
        ghosts,
        hwnd: 0,
        craftman: "Nanai Project".to_string(),
    };

    serde_json::to_string(&fmo).map_err(|e| e.to_string())
}

/// バルーン表示テキストを FMO に同期更新する Tauri コマンド (UKADOC fmo balloon0, balloon1 準拠)
#[tauri::command]
pub async fn update_fmo_balloon_text(
    balloon0: String,
    balloon1: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let current_name = state
        .current_ghost_name
        .lock()
        .clone()
        .unwrap_or_else(|| "Nanai".to_string());

    let mut entry = FmoEntry::new("0", current_name)
        .with_keroname("Kero")
        .with_balloons(balloon0, balloon1)
        .with_modulestate("shiori:running");
    entry.update_lifecycle("active", true);

    let mut ghosts = HashMap::new();
    ghosts.insert(
        entry.id().to_string(),
        FmoGhostStatus {
            name: entry.name().to_string(),
            keroname: entry.keroname().to_string(),
            surface0: entry.sakura_surface() as u32,
            surface1: entry.kero_surface() as u32,
            balloon0: entry.balloon0().to_string(),
            balloon1: entry.balloon1().to_string(),
            kerohwnd: entry.kerohwnd(),
            modulestate: entry.modulestate().map(ToString::to_string),
            path: entry.ghostpath().to_string(),
            is_visible: entry.is_visible(),
            lifecycle_state: entry.lifecycle_state().to_string(),
        },
    );

    let fmo = FmoSystemStatus {
        ghosts,
        hwnd: 0,
        craftman: "Nanai Project".to_string(),
    };

    serde_json::to_string(&fmo).map_err(|e| e.to_string())
}

/// サーフィス番号を FMO に同期更新する Tauri コマンド
#[tauri::command]
pub async fn update_fmo_surfaces(
    surface0: u32,
    surface1: u32,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let current_name = state
        .current_ghost_name
        .lock()
        .clone()
        .unwrap_or_else(|| "Nanai".to_string());

    let mut entry = FmoEntry::new("0", current_name)
        .with_keroname("Kero")
        .with_surfaces(surface0 as i32, surface1 as i32)
        .with_modulestate("shiori:running");
    entry.update_lifecycle("active", true);

    let mut ghosts = HashMap::new();
    ghosts.insert(
        entry.id().to_string(),
        FmoGhostStatus {
            name: entry.name().to_string(),
            keroname: entry.keroname().to_string(),
            surface0: entry.sakura_surface() as u32,
            surface1: entry.kero_surface() as u32,
            balloon0: entry.balloon0().to_string(),
            balloon1: entry.balloon1().to_string(),
            kerohwnd: entry.kerohwnd(),
            modulestate: entry.modulestate().map(ToString::to_string),
            path: entry.ghostpath().to_string(),
            is_visible: entry.is_visible(),
            lifecycle_state: entry.lifecycle_state().to_string(),
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

    let mut entry = FmoEntry::new("0", current_name)
        .with_keroname("Kero")
        .with_modulestate("shiori:running");
    entry.update_lifecycle(&lifecycle_state, is_visible);

    let mut ghosts = HashMap::new();
    ghosts.insert(
        entry.id().to_string(),
        FmoGhostStatus {
            name: entry.name().to_string(),
            keroname: entry.keroname().to_string(),
            surface0: entry.sakura_surface() as u32,
            surface1: entry.kero_surface() as u32,
            balloon0: entry.balloon0().to_string(),
            balloon1: entry.balloon1().to_string(),
            kerohwnd: entry.kerohwnd(),
            modulestate: entry.modulestate().map(ToString::to_string),
            path: entry.ghostpath().to_string(),
            is_visible: entry.is_visible(),
            lifecycle_state: entry.lifecycle_state().to_string(),
        },
    );

    let fmo = FmoSystemStatus {
        ghosts,
        hwnd: 0,
        craftman: "Nanai Project".to_string(),
    };

    serde_json::to_string(&fmo).map_err(|e| e.to_string())
}

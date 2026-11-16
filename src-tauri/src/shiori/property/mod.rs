//! UKADOC Property System 仕様に準拠したプロパティ問い合わせ評価モジュール

#![allow(dead_code)]

pub mod evaluator;

#[cfg(test)]
mod tests;

use crate::common::state::AppState;
pub use evaluator::{
    SystemMonitorInfo, evaluate_property_query, evaluate_property_query_full,
    evaluate_property_query_with_context, evaluate_property_query_with_ghost_info,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyQueryRequest {
    query: String,
}

impl PropertyQueryRequest {
    pub fn new(query: String) -> Self {
        Self { query }
    }

    // Add getter methods
    pub fn query(&self) -> &str {
        &self.query
    }
}

#[tauri::command]
pub async fn get_system_property(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    query: String,
) -> Result<String, String> {
    let ghost_guard = state.current_ghost_name.lock();
    let current_ghost = ghost_guard.as_deref();
    let active_ghosts_guard = state.active_ghosts.lock();
    let active_count = active_ghosts_guard.len();

    let primary_name = app
        .primary_monitor()
        .ok()
        .flatten()
        .and_then(|m| m.name().map(|s| s.to_string()));

    let bpp = evaluator::dynamic_rules::get_display_bpp();

    let monitors: Vec<SystemMonitorInfo> = if let Ok(mon_list) = app.available_monitors() {
        mon_list
            .into_iter()
            .map(|m| {
                let pos = m.position();
                let size = m.size();
                let is_primary = m.name().map(|s| s.to_string()) == primary_name;
                SystemMonitorInfo {
                    left: pos.x,
                    top: pos.y,
                    right: pos.x + size.width as i32,
                    bottom: pos.y + size.height as i32,
                    scale_factor: m.scale_factor(),
                    bpp,
                    is_primary,
                }
            })
            .collect()
    } else {
        Vec::new()
    };

    Ok(evaluate_property_query_full(
        &query,
        None,
        Some(active_count),
        &monitors,
    ))
}

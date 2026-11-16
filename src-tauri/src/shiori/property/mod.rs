//! UKADOC Property System 仕様に準拠したプロパティ問い合わせ評価モジュール

#![allow(dead_code)]

pub mod evaluator;

#[cfg(test)]
mod tests;

use crate::common::state::AppState;
pub use evaluator::{evaluate_property_query, evaluate_property_query_with_context};
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
    state: tauri::State<'_, AppState>,
    query: String,
) -> Result<String, String> {
    let ghost_guard = state.current_ghost_name.lock();
    let current_ghost = ghost_guard.as_deref();
    let active_ghosts_guard = state.active_ghosts.lock();
    let active_count = active_ghosts_guard.len();

    Ok(evaluate_property_query_with_context(
        &query,
        current_ghost,
        Some(active_count),
    ))
}

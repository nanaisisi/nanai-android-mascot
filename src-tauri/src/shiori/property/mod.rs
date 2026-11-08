//! UKADOC Property System 仕様に準拠したプロパティ問い合わせ評価モジュール

#![allow(dead_code)]

pub mod evaluator;

#[cfg(test)]
mod tests;

pub use evaluator::evaluate_property_query;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyQueryRequest {
    pub query: String,
}

#[tauri::command]
pub async fn get_system_property(query: String) -> Result<String, String> {
    Ok(evaluate_property_query(&query))
}

//! UKADOC Property System 仕様に準拠したプロパティ評価エンジンモジュール

pub mod dynamic_rules;
pub mod static_rules;

use dynamic_rules::evaluate_dynamic_property;
use static_rules::evaluate_static_property;

/// Evaluate property system queries with optional active ghost and app context
pub fn evaluate_property_query_with_context(
    query: &str,
    current_ghost_name: Option<&str>,
    active_ghost_count: Option<usize>,
) -> String {
    let q = query.trim().to_lowercase();

    if let Some(ghost_name) = current_ghost_name {
        match q.as_str() {
            "currentghost.name" | "name" => return ghost_name.to_string(),
            "currentghost.path" => return format!("ghost/{}", ghost_name),
            "ghostlist.index(0).name" | "ghostlist.index(0)" => return ghost_name.to_string(),
            "ghostlist.index(0).path" => return format!("ghost/{}", ghost_name),
            "ghostlist.count" => {
                return active_ghost_count.unwrap_or(1).max(1).to_string();
            }
            _ => {}
        }
    }

    if let Some(val) = evaluate_static_property(&q) {
        val
    } else {
        evaluate_dynamic_property(&q, query)
    }
}

/// Evaluate property system queries conforming to UKADOC propertysystem spec (default context)
pub fn evaluate_property_query(query: &str) -> String {
    evaluate_property_query_with_context(query, None, None)
}

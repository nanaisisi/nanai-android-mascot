//! UKADOC Property System 仕様に準拠したプロパティ評価エンジンモジュール

pub mod dynamic_rules;
pub mod static_rules;

use dynamic_rules::evaluate_dynamic_property;
use static_rules::evaluate_static_property;

/// Evaluate property system queries conforming to UKADOC propertysystem spec
pub fn evaluate_property_query(query: &str) -> String {
    let q = query.trim().to_lowercase();
    if let Some(val) = evaluate_static_property(&q) {
        val
    } else {
        evaluate_dynamic_property(&q, query)
    }
}

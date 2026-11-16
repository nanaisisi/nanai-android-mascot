//! UKADOC Property System 仕様に準拠したプロパティ評価エンジンモジュール

pub mod dynamic_rules;
pub mod static_rules;

use crate::common::models::GhostInfo;
use dynamic_rules::evaluate_dynamic_property;
use static_rules::evaluate_static_property;

/// Evaluate property system queries with optional active GhostInfo and app context
pub fn evaluate_property_query_with_ghost_info(
    query: &str,
    ghost: Option<&GhostInfo>,
    active_ghost_count: Option<usize>,
) -> String {
    let q = query.trim().to_lowercase();

    if let Some(g) = ghost {
        match q.as_str() {
            "currentghost.name" | "name" => return g.name().to_string(),
            "currentghost.path" => return g.path().to_string(),
            "currentghost.craftman" | "craftman" | "craftmanw" => {
                return g.craftman().unwrap_or("").to_string();
            }
            "currentghost.craftmanurl" | "craftmanurl" => {
                return g.craftman_url().unwrap_or("").to_string();
            }
            "sakuraname" | "sakura.name" => return g.sakura_name().unwrap_or("").to_string(),
            "keroname" | "kero.name" => return g.kero_name().unwrap_or("").to_string(),
            "version" => return g.version().unwrap_or("").to_string(),
            "update_result" => return g.update_result().unwrap_or("none").to_string(),
            "update_date" => return g.update_date().unwrap_or("").to_string(),
            "install_date" => return g.install_date().unwrap_or("").to_string(),
            "recommended.balloon" | "recommended_balloon" => {
                return g.recommended_balloon().unwrap_or("").to_string();
            }
            "recommended.balloon.path" => {
                return g.recommended_balloon_path().unwrap_or("").to_string();
            }
            "default.balloon.path" => {
                return g.default_balloon_path().unwrap_or("").to_string();
            }
            "ghostlist.index(0).name" | "ghostlist.index(0)" => return g.name().to_string(),
            "ghostlist.index(0).path" => return g.path().to_string(),
            "ghostlist.count" | "activeghostlist.count" => {
                return active_ghost_count.unwrap_or(1).max(1).to_string();
            }
            "currentghost.shelllist.count" => {
                return g.shells().len().max(1).to_string();
            }
            "currentghost.shelllist.current.name" | "currentghost.shelllist.current" => {
                return g
                    .shells()
                    .first()
                    .map(|s| s.name.as_str())
                    .unwrap_or("master")
                    .to_string();
            }
            "currentghost.scope.count" => {
                return g.num_characters().max(1).to_string();
            }
            _ => {}
        }
    } else {
        match q.as_str() {
            "currentghost.name"
            | "name"
            | "currentghost.path"
            | "ghostlist.index(0).name"
            | "ghostlist.index(0)"
            | "ghostlist.index(0).path"
            | "craftman"
            | "craftmanw"
            | "craftmanurl"
            | "sakuraname"
            | "keroname" => return String::new(),
            "ghostlist.count" => return "0".to_string(),
            _ => {}
        }
    }

    if let Some(val) = evaluate_static_property(&q) {
        val
    } else {
        evaluate_dynamic_property(&q, query)
    }
}

pub fn evaluate_property_query_with_context(
    query: &str,
    current_ghost_name: Option<&str>,
    active_ghost_count: Option<usize>,
) -> String {
    if let Some(ghost_name) = current_ghost_name {
        let dummy_ghost = GhostInfo {
            name: ghost_name.to_string(),
            path: format!("ghost/{}", ghost_name),
            ..Default::default()
        };
        evaluate_property_query_with_ghost_info(query, Some(&dummy_ghost), active_ghost_count)
    } else {
        evaluate_property_query_with_ghost_info(query, None, active_ghost_count)
    }
}

/// Evaluate property system queries conforming to UKADOC propertysystem spec (default context)
pub fn evaluate_property_query(query: &str) -> String {
    evaluate_property_query_with_context(query, None, None)
}

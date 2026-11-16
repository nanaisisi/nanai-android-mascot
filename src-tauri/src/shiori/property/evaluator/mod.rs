//! UKADOC Property System 仕様に準拠したプロパティ評価エンジンモジュール

pub mod dynamic_rules;
pub mod rules;
pub mod static_rules;

use crate::common::models::GhostInfo;
use dynamic_rules::evaluate_dynamic_property;
use static_rules::evaluate_static_property;

#[derive(Debug, Clone, Default)]
pub struct SystemMonitorInfo {
    pub left: i32,
    pub top: i32,
    pub right: i32,
    pub bottom: i32,
    pub work_left: i32,
    pub work_top: i32,
    pub work_right: i32,
    pub work_bottom: i32,
    pub scale_factor: f64,
    pub bpp: u32,
    pub is_primary: bool,
}

/// Evaluate property system queries with optional active GhostInfo, app context, monitors, and window_mode
pub fn evaluate_property_query_full(
    query: &str,
    ghost: Option<&GhostInfo>,
    active_ghost_count: Option<usize>,
    monitors: &[SystemMonitorInfo],
    window_mode: Option<&str>,
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
            "ghostlist.index(0).name" | "ghostlist.index(0)" | "ghostlist.current.name" => {
                return g.name().to_string();
            }
            "ghostlist.index(0).path" | "ghostlist.current.path" => return g.path().to_string(),
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

        // Evaluate ghostlist(KEY).property_name
        if let Some(ghost_prop) = q.strip_prefix("ghostlist(")
            && let Some(idx) = ghost_prop.find(").")
        {
            let key = &ghost_prop[..idx];
            let prop = &ghost_prop[idx + 2..];
            if key == g.name().to_lowercase()
                || key == g.path().to_lowercase()
                || key == g.sakura_name().unwrap_or("").to_lowercase()
            {
                return match prop {
                    "name" => g.name().to_string(),
                    "sakuraname" | "sakura.name" => g.sakura_name().unwrap_or("").to_string(),
                    "keroname" | "kero.name" => g.kero_name().unwrap_or("").to_string(),
                    "craftman" | "craftmanw" => g.craftman().unwrap_or("").to_string(),
                    "craftmanurl" => g.craftman_url().unwrap_or("").to_string(),
                    "path" => g.path().to_string(),
                    "version" => g.version().unwrap_or("").to_string(),
                    _ => String::new(),
                };
            }
        }

        // Evaluate currentghost.shelllist(KEY).property_name
        if let Some(shell_prop) = q.strip_prefix("currentghost.shelllist(")
            && let Some(idx) = shell_prop.find(").")
        {
            let key = &shell_prop[..idx];
            let prop = &shell_prop[idx + 2..];
            if let Some(s) = g
                .shells()
                .iter()
                .find(|s| s.name.to_lowercase() == key || s.path.to_lowercase() == key)
            {
                return match prop {
                    "name" => s.name.clone(),
                    "path" => s.path.clone(),
                    "display_name" => s.display_name.clone().unwrap_or_default(),
                    _ => String::new(),
                };
            }
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
        evaluate_dynamic_property(&q, query, monitors, window_mode)
    }
}

pub fn evaluate_property_query_with_ghost_info(
    query: &str,
    ghost: Option<&GhostInfo>,
    active_ghost_count: Option<usize>,
) -> String {
    evaluate_property_query_full(query, ghost, active_ghost_count, &[], None)
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

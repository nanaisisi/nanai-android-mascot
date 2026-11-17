//! 接頭辞・パターン一致型動的プロパティ評価モジュール

use super::SystemMonitorInfo;
use super::rules::{
    baseware::evaluate_baseware_property, ghost_scope::evaluate_ghost_scope,
    system::evaluate_system_subsystem,
};

pub(super) fn evaluate_dynamic_property(
    q: &str,
    raw_query: &str,
    monitors: &[SystemMonitorInfo],
    window_mode: Option<&str>,
) -> String {
    if let Some(shiori_var) = q.strip_prefix("shiori.") {
        return match shiori_var {
            "version" => "3.0".to_string(),
            "name" => "SHIORI/3.0 Standard".to_string(),
            "craftman" => "Nanai Project".to_string(),
            "craftmanurl" => "https://example.com/shiori".to_string(),
            "encoding" => "UTF-8".to_string(),
            _ => format!("(unknown shiori property: {})", shiori_var),
        };
    }

    if let Some(bw_sub) = q.strip_prefix("baseware.") {
        return evaluate_baseware_property(bw_sub, window_mode);
    }

    if let Some(sys_sub) = q.strip_prefix("system.") {
        return evaluate_system_subsystem(sys_sub, raw_query, monitors);
    }

    if let Some(val) = evaluate_ghost_scope(q) {
        return val;
    }

    if q.starts_with("currentghost.balloon.") {
        return "1".to_string();
    }

    if (q.starts_with("char") || q.starts_with("sakura") || q.starts_with("kero"))
        && (q.ends_with(".bind.menu") || q.ends_with(".menu"))
    {
        return "auto".to_string();
    }

    if q.starts_with("history.balloon.index(")
        || q.starts_with("history.balloon(")
        || q.starts_with("history.balloon")
    {
        return "1".to_string();
    }

    format!("(unknown property: {})", raw_query)
}

pub use super::rules::system_hardware::get_display_bpp;

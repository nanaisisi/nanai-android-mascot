//! 接頭辞・パターン一致型動的プロパティ評価モジュール

use super::rules::{
    ghost_scope::evaluate_ghost_scope,
    system_cpu::evaluate_system_cpu,
    system_hardware::{
        evaluate_system_disk, evaluate_system_memory, evaluate_system_monitor,
        evaluate_system_power,
    },
    system_os::evaluate_system_os,
};
use super::SystemMonitorInfo;

pub(super) fn evaluate_dynamic_property(
    q: &str,
    raw_query: &str,
    monitors: &[SystemMonitorInfo],
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

    if let Some(sub) = q.strip_prefix("system.os.") {
        return evaluate_system_os(sub);
    }

    if let Some(sub) = q.strip_prefix("system.cpu.") {
        return evaluate_system_cpu(sub);
    }

    if let Some(sub) = q.strip_prefix("system.memory.") {
        return evaluate_system_memory(sub);
    }

    if q.starts_with("system.power.") {
        return evaluate_system_power();
    }

    if q.starts_with("system.network.") {
        return "online".to_string();
    }

    if let Some(val) = evaluate_system_monitor(q, monitors) {
        return val;
    }

    if let Some(val) = evaluate_system_disk(q) {
        return val;
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

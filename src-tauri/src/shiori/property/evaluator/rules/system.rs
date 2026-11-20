//! system.* プロパティ群の統合評価モジュール

use super::super::SystemMonitorInfo;
use super::{
    system_cpu::evaluate_system_cpu,
    system_hardware::{
        evaluate_system_disk, evaluate_system_memory, evaluate_system_monitor,
        evaluate_system_network, evaluate_system_power,
    },
    system_os::{evaluate_system_os, evaluate_theme_mode, get_system_dnd_mode},
};

pub fn evaluate_system_subsystem(
    sub: &str,
    raw_query: &str,
    monitors: &[SystemMonitorInfo],
) -> String {
    if let Some(os_sub) = sub.strip_prefix("os.") {
        return evaluate_system_os(os_sub);
    }
    if let Some(cpu_sub) = sub.strip_prefix("cpu.") {
        return evaluate_system_cpu(cpu_sub);
    }
    if let Some(mem_sub) = sub.strip_prefix("memory.") {
        return evaluate_system_memory(mem_sub);
    }
    if let Some(pow_sub) = sub.strip_prefix("power.") {
        return evaluate_system_power(pow_sub);
    }
    if let Some(net_sub) = sub.strip_prefix("network.") {
        return evaluate_system_network(net_sub);
    }
    if sub.starts_with("disk.") {
        let full_q = format!("system.{}", sub);
        if let Some(val) = evaluate_system_disk(&full_q) {
            return val;
        }
    }
    if sub.starts_with("monitor.") {
        let full_q = format!("system.{}", sub);
        if let Some(val) = evaluate_system_monitor(&full_q, monitors) {
            return val;
        }
    }
    if let Some(theme_sub) = sub.strip_prefix("theme.") {
        if theme_sub == "os.mode" {
            return evaluate_theme_mode(true);
        }
        if theme_sub == "app.mode" {
            return evaluate_theme_mode(false);
        }
    }
    if sub == "dnd.mode" {
        return get_system_dnd_mode();
    }
    if sub == "cursor.pos" {
        let (x, y) = get_mouse_cursor_pos();
        return format!("{},{}", x, y);
    }

    // System date and time
    let now = jiff::ZonedDateTime::now();
    match sub {
        "year" => now.year().to_string(),
        "month" => now.month().to_string(),
        "day" => now.day().to_string(),
        "hour" => now.hour().to_string(),
        "minute" => now.minute().to_string(),
        "second" => now.second().to_string(),
        "millisecond" => now.millisecond().to_string(),
        "dayofweek" => now.weekday().to_sunday_zero_offset().to_string(),
        _ => format!("(unknown property: {})", raw_query),
    }
}

#[cfg(target_os = "windows")]
fn get_mouse_cursor_pos() -> (i32, i32) {
    use windows_sys::Win32::Foundation::POINT;
    use windows_sys::Win32::UI::WindowsAndMessaging::GetCursorPos;
    let mut pt: POINT = unsafe { std::mem::zeroed() };
    if unsafe { GetCursorPos(&mut pt) } != 0 {
        return (pt.x, pt.y);
    }
    (0, 0)
}

#[cfg(not(target_os = "windows"))]
fn get_mouse_cursor_pos() -> (i32, i32) {
    (0, 0)
}

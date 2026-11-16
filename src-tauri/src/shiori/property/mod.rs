//! UKADOC Property System 仕様に準拠したプロパティ問い合わせ評価モジュール

#![allow(dead_code)]

pub mod evaluator;

#[cfg(test)]
mod tests;

use crate::common::state::AppState;
pub use evaluator::{
    evaluate_property_query, evaluate_property_query_full, evaluate_property_query_with_context,
    evaluate_property_query_with_ghost_info, SystemMonitorInfo,
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

#[cfg(target_os = "windows")]
fn query_win32_monitors() -> Vec<SystemMonitorInfo> {
    use windows_sys::Win32::Graphics::Gdi::{
        EnumDisplayMonitors, GetMonitorInfoW, HDC, HMONITOR, LPRECT, MONITORINFO,
        MONITORINFOF_PRIMARY,
    };

    unsafe extern "system" fn monitor_enum_proc(
        hmonitor: HMONITOR,
        _hdc: HDC,
        _rect: LPRECT,
        lparam: isize,
    ) -> i32 {
        let list = &mut *(lparam as *mut Vec<SystemMonitorInfo>);
        let mut info: MONITORINFO = std::mem::zeroed();
        info.cbSize = std::mem::size_of::<MONITORINFO>() as u32;
        if GetMonitorInfoW(hmonitor, &mut info) != 0 {
            let is_primary = (info.dwFlags & MONITORINFOF_PRIMARY) != 0;
            let bpp = evaluator::dynamic_rules::get_display_bpp();
            list.push(SystemMonitorInfo {
                left: info.rcMonitor.left,
                top: info.rcMonitor.top,
                right: info.rcMonitor.right,
                bottom: info.rcMonitor.bottom,
                work_left: info.rcWork.left,
                work_top: info.rcWork.top,
                work_right: info.rcWork.right,
                work_bottom: info.rcWork.bottom,
                scale_factor: 1.0,
                bpp,
                is_primary,
            });
        }
        1
    }

    let mut list = Vec::new();
    unsafe {
        EnumDisplayMonitors(
            0 as _,
            std::ptr::null_mut(),
            Some(monitor_enum_proc),
            &mut list as *mut _ as isize,
        );
    }
    list
}

#[tauri::command]
pub async fn get_system_property(
    _app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    query: String,
) -> Result<String, String> {
    let ghost_guard = state.current_ghost_name.lock();
    let current_ghost = ghost_guard.as_deref();
    let active_ghosts_guard = state.active_ghosts.lock();
    let active_count = active_ghosts_guard.len();

    #[cfg(target_os = "windows")]
    let monitors = query_win32_monitors();

    #[cfg(not(target_os = "windows"))]
    let monitors: Vec<SystemMonitorInfo> = if let Ok(mon_list) = _app.available_monitors() {
        let primary_name = _app
            .primary_monitor()
            .ok()
            .flatten()
            .and_then(|m| m.name().map(|s| s.to_string()));
        let bpp = evaluator::dynamic_rules::get_display_bpp();
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
                    work_left: pos.x,
                    work_top: pos.y,
                    work_right: pos.x + size.width as i32,
                    work_bottom: pos.y + size.height as i32 - 40,
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

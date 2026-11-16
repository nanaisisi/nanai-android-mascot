//! system.memory / system.disk / system.power / system.monitor プロパティ評価モジュール

use super::super::SystemMonitorInfo;

pub fn evaluate_system_memory(sub: &str) -> String {
    let (free_mb, total_mb) = get_memory_info_mb();
    match sub {
        "free" | "available" => free_mb.to_string(),
        "total" => total_mb.to_string(),
        "used" => total_mb.saturating_sub(free_mb).to_string(),
        _ => total_mb.to_string(),
    }
}

pub fn evaluate_system_power() -> String {
    get_power_status()
}

pub fn evaluate_system_monitor(q: &str, monitors: &[SystemMonitorInfo]) -> Option<String> {
    if q == "system.monitor.count" {
        return Some(monitors.len().max(1).to_string());
    }
    if let Some(mon_prop) = q.strip_prefix("system.monitor.index(")
        && let Some(idx) = mon_prop.find(").")
    {
        let mon_id = mon_prop[..idx].parse::<usize>().unwrap_or(0);
        let subkey = &mon_prop[idx + 2..];
        if let Some(mon) = monitors.get(mon_id) {
            return Some(match subkey {
                "rect" => format!("{},{},{},{}", mon.left, mon.top, mon.right, mon.bottom),
                "work" => format!(
                    "{},{},{},{}",
                    mon.work_left, mon.work_top, mon.work_right, mon.work_bottom
                ),
                "dpi" => format!("{:.0}", mon.scale_factor * 96.0),
                "bpp" => mon.bpp.to_string(),
                "primary" => {
                    if mon.is_primary {
                        "1".to_string()
                    } else {
                        "0".to_string()
                    }
                }
                _ => "0".to_string(),
            });
        } else if mon_id == 0 {
            let work = get_primary_work_area_rect();
            let bpp = get_display_bpp();
            return Some(match subkey {
                "rect" => "0,0,1920,1080".to_string(),
                "work" => format!("{},{},{},{}", work.0, work.1, work.2, work.3),
                "dpi" => "96".to_string(),
                "bpp" => bpp.to_string(),
                "primary" => "1".to_string(),
                _ => "0".to_string(),
            });
        } else {
            return Some("0".to_string());
        }
    }
    None
}

pub fn evaluate_system_disk(q: &str) -> Option<String> {
    if q == "system.disk.count" {
        return Some("1".to_string());
    }
    if let Some(disk_prop) = q.strip_prefix("system.disk.index(")
        && let Some(idx) = disk_prop.find(").")
    {
        let disk_id = disk_prop[..idx].parse::<usize>().unwrap_or(0);
        let subkey = &disk_prop[idx + 2..];
        let (free_mb, total_mb) = get_disk_space_info(".");
        return Some(match subkey {
            "mountpoint" => {
                if cfg!(target_os = "windows") {
                    "C:".to_string()
                } else {
                    "/".to_string()
                }
            }
            "type" => "fixed".to_string(),
            "total" => {
                if disk_id == 0 {
                    total_mb.to_string()
                } else {
                    "-1".to_string()
                }
            }
            "free" => {
                if disk_id == 0 {
                    free_mb.to_string()
                } else {
                    "-1".to_string()
                }
            }
            _ => "-1".to_string(),
        });
    }
    None
}

#[cfg(target_os = "windows")]
pub fn get_display_bpp() -> u32 {
    use windows_sys::Win32::Graphics::Gdi::{GetDC, GetDeviceCaps, ReleaseDC, BITSPIXEL};
    unsafe {
        let hdc = GetDC(std::ptr::null_mut());
        if !hdc.is_null() {
            let bpp = GetDeviceCaps(hdc, BITSPIXEL);
            ReleaseDC(std::ptr::null_mut(), hdc);
            if bpp > 0 {
                return bpp as u32;
            }
        }
    }
    32
}

#[cfg(not(target_os = "windows"))]
pub fn get_display_bpp() -> u32 {
    32
}

#[cfg(target_os = "windows")]
fn get_primary_work_area_rect() -> (i32, i32, i32, i32) {
    use windows_sys::Win32::Foundation::RECT;
    use windows_sys::Win32::UI::WindowsAndMessaging::{SystemParametersInfoW, SPI_GETWORKAREA};
    let mut rect: RECT = unsafe { std::mem::zeroed() };
    if unsafe {
        SystemParametersInfoW(
            SPI_GETWORKAREA,
            0,
            &mut rect as *mut _ as *mut _,
            0,
        )
    } != 0
    {
        return (rect.left, rect.top, rect.right, rect.bottom);
    }
    (0, 0, 1920, 1040)
}

#[cfg(not(target_os = "windows"))]
fn get_primary_work_area_rect() -> (i32, i32, i32, i32) {
    (0, 0, 1920, 1040)
}

#[cfg(target_os = "windows")]
fn get_memory_info_mb() -> (u64, u64) {
    use windows_sys::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
    let mut status: MEMORYSTATUSEX = unsafe { std::mem::zeroed() };
    status.dwLength = std::mem::size_of::<MEMORYSTATUSEX>() as u32;
    if unsafe { GlobalMemoryStatusEx(&mut status) } != 0 {
        let total_mb = status.ullTotalPhys / (1024 * 1024);
        let free_mb = status.ullAvailPhys / (1024 * 1024);
        return (free_mb, total_mb);
    }
    (1024, 4096)
}

#[cfg(not(target_os = "windows"))]
fn get_memory_info_mb() -> (u64, u64) {
    if let Ok(content) = std::fs::read_to_string("/proc/meminfo") {
        let mut total_kb = 0u64;
        let mut free_kb = 0u64;
        for line in content.lines() {
            if line.starts_with("MemTotal:") {
                if let Some(val) = line
                    .split_whitespace()
                    .nth(1)
                    .and_then(|s| s.parse::<u64>().ok())
                {
                    total_kb = val;
                }
            } else if line.starts_with("MemAvailable:") || line.starts_with("MemFree:") {
                if let Some(val) = line
                    .split_whitespace()
                    .nth(1)
                    .and_then(|s| s.parse::<u64>().ok())
                {
                    free_kb = val;
                }
            }
        }
        if total_kb > 0 {
            return (free_kb / 1024, total_kb / 1024);
        }
    }
    (1024, 4096)
}

#[cfg(target_os = "windows")]
fn get_disk_space_info(path: &str) -> (u64, u64) {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    let path_wide: Vec<u16> = OsStr::new(path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let mut free_bytes = 0u64;
    let mut total_bytes = 0u64;
    let mut total_free = 0u64;
    unsafe {
        if windows_sys::Win32::Storage::FileSystem::GetDiskFreeSpaceExW(
            path_wide.as_ptr(),
            &mut free_bytes,
            &mut total_bytes,
            &mut total_free,
        ) != 0
        {
            return (free_bytes / (1024 * 1024), total_bytes / (1024 * 1024));
        }
    }
    (100000, 500000)
}

#[cfg(target_os = "android")]
fn get_disk_space_info(_path: &str) -> (u64, u64) {
    use std::ffi::CString;
    if let Ok(c_path) = CString::new("/data") {
        let mut stat: libc::statvfs = unsafe { std::mem::zeroed() };
        if unsafe { libc::statvfs(c_path.as_ptr(), &mut stat) } == 0 {
            let free_mb = (stat.f_bavail as u64 * stat.f_frsize as u64) / (1024 * 1024);
            let total_mb = (stat.f_blocks as u64 * stat.f_frsize as u64) / (1024 * 1024);
            return (free_mb, total_mb);
        }
    }
    (100000, 500000)
}

#[cfg(all(not(target_os = "windows"), not(target_os = "android")))]
fn get_disk_space_info(path: &str) -> (u64, u64) {
    use std::ffi::CString;
    let target = if path.is_empty() { "/" } else { path };
    if let Ok(c_path) = CString::new(target) {
        let mut stat: libc::statvfs = unsafe { std::mem::zeroed() };
        if unsafe { libc::statvfs(c_path.as_ptr(), &mut stat) } == 0 {
            let free_mb = (stat.f_bavail as u64 * stat.f_frsize as u64) / (1024 * 1024);
            let total_mb = (stat.f_blocks as u64 * stat.f_frsize as u64) / (1024 * 1024);
            return (free_mb, total_mb);
        }
    }
    (100000, 500000)
}

#[cfg(target_os = "windows")]
fn get_power_status() -> String {
    use windows_sys::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};
    let mut status: SYSTEM_POWER_STATUS = unsafe { std::mem::zeroed() };
    if unsafe { GetSystemPowerStatus(&mut status) } != 0 {
        if status.ACLineStatus == 1 {
            return "ac".to_string();
        } else if status.ACLineStatus == 0 {
            return format!("battery,{}", status.BatteryLifePercent);
        }
    }
    "ac".to_string()
}

#[cfg(target_os = "android")]
fn get_power_status() -> String {
    let mut is_charging = false;
    if let Ok(status) = std::fs::read_to_string("/sys/class/power_supply/battery/status") {
        let s = status.trim().to_lowercase();
        if s == "charging" || s == "full" {
            is_charging = true;
        }
    }
    if is_charging {
        return "ac".to_string();
    }
    if let Ok(cap) = std::fs::read_to_string("/sys/class/power_supply/battery/capacity") {
        if let Ok(pct) = cap.trim().parse::<u32>() {
            return format!("battery,{}", pct);
        }
    }
    "ac".to_string()
}

#[cfg(all(not(target_os = "windows"), not(target_os = "android")))]
fn get_power_status() -> String {
    if let Ok(ac) = std::fs::read_to_string("/sys/class/power_supply/AC/online") {
        if ac.trim() == "1" {
            return "ac".to_string();
        }
    }
    if let Ok(ac) = std::fs::read_to_string("/sys/class/power_supply/ACAD/online") {
        if ac.trim() == "1" {
            return "ac".to_string();
        }
    }
    "ac".to_string()
}

//! system.memory / system.disk / system.power / system.monitor プロパティ評価モジュール

use super::super::SystemMonitorInfo;

#[derive(Debug, Clone)]
pub struct SystemDiskInfo {
    pub mountpoint: String,
    pub drive_type: String,
    pub total_mb: i64,
    pub free_mb: i64,
}

pub fn evaluate_system_memory(sub: &str) -> String {
    let (free_mb, total_mb) = get_memory_info_mb();
    match sub {
        "free" | "available" => free_mb.to_string(),
        "total" => total_mb.to_string(),
        "used" => total_mb.saturating_sub(free_mb).to_string(),
        _ => total_mb.to_string(),
    }
}

pub fn evaluate_system_power(q: &str) -> String {
    get_power_status(q)
}

pub fn evaluate_system_network(q: &str) -> String {
    let sub = q.strip_prefix("system.network.").unwrap_or(q);
    let ip = get_local_ip_address();
    let is_online = ip != "127.0.0.1" && !ip.is_empty();

    match sub {
        "status" => {
            if is_online {
                "online".to_string()
            } else {
                "offline".to_string()
            }
        }
        "ipaddress" => ip,
        "type" => {
            if !is_online {
                "none".to_string()
            } else {
                "ethernet".to_string()
            }
        }
        "cost" => {
            if !is_online {
                "unknown".to_string()
            } else {
                "unrestricted".to_string()
            }
        }
        "downlink" | "downlink.estimate" => {
            if is_online {
                "1000".to_string()
            } else {
                "0".to_string()
            }
        }
        _ => "online".to_string(),
    }
}

fn get_local_ip_address() -> String {
    if let Ok(socket) = std::net::UdpSocket::bind("0.0.0.0:0") {
        if socket.connect("8.8.8.8:80").is_ok() {
            if let Ok(addr) = socket.local_addr() {
                return addr.ip().to_string();
            }
        }
    }
    "127.0.0.1".to_string()
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
    let disks = get_system_disks();
    if q == "system.disk.count" {
        return Some(disks.len().to_string());
    }
    if let Some(disk_prop) = q.strip_prefix("system.disk.index(")
        && let Some(idx) = disk_prop.find(").")
    {
        let disk_id = disk_prop[..idx].parse::<usize>().unwrap_or(0);
        let subkey = &disk_prop[idx + 2..];
        if let Some(disk) = disks.get(disk_id) {
            return Some(match subkey {
                "mountpoint" => disk.mountpoint.clone(),
                "type" => disk.drive_type.clone(),
                "total" => disk.total_mb.to_string(),
                "free" => disk.free_mb.to_string(),
                _ => "-1".to_string(),
            });
        } else {
            return Some(match subkey {
                "mountpoint" => String::new(),
                "type" => "unknown".to_string(),
                "total" | "free" => "-1".to_string(),
                _ => "-1".to_string(),
            });
        }
    }
    None
}

#[cfg(target_os = "windows")]
pub fn get_system_disks() -> Vec<SystemDiskInfo> {
    use windows_sys::Win32::Storage::FileSystem::{
        GetDiskFreeSpaceExW, GetDriveTypeW, GetLogicalDriveStringsW, DRIVE_CDROM, DRIVE_FIXED,
        DRIVE_RAMDISK, DRIVE_REMOTE, DRIVE_REMOVABLE,
    };
    let mut buf = [0u16; 512];
    let len = unsafe { GetLogicalDriveStringsW(buf.len() as u32, buf.as_mut_ptr()) };
    let mut disks = Vec::new();

    if len > 0 {
        let mut start = 0;
        for i in 0..len as usize {
            if buf[i] == 0 {
                if start < i {
                    let drive_path_slice = &buf[start..i];
                    let drive_path = String::from_utf16_lossy(drive_path_slice);
                    let mountpoint = drive_path.trim_end_matches('\\').to_string();

                    let dtype_code = unsafe { GetDriveTypeW(drive_path_slice.as_ptr()) };
                    let drive_type = match dtype_code {
                        DRIVE_REMOVABLE => "removable",
                        DRIVE_FIXED => "fixed",
                        DRIVE_REMOTE => "network",
                        DRIVE_CDROM => "optical",
                        DRIVE_RAMDISK => "ram",
                        _ => "unknown",
                    }
                    .to_string();

                    let mut free_bytes = 0u64;
                    let mut total_bytes = 0u64;
                    let mut total_free = 0u64;
                    let (free_mb, total_mb) = unsafe {
                        if GetDiskFreeSpaceExW(
                            drive_path_slice.as_ptr(),
                            &mut free_bytes,
                            &mut total_bytes,
                            &mut total_free,
                        ) != 0
                        {
                            (
                                (free_bytes / (1024 * 1024)) as i64,
                                (total_bytes / (1024 * 1024)) as i64,
                            )
                        } else {
                            (-1, -1)
                        }
                    };

                    disks.push(SystemDiskInfo {
                        mountpoint,
                        drive_type,
                        total_mb,
                        free_mb,
                    });
                }
                start = i + 1;
            }
        }
    }

    if disks.is_empty() {
        let (free_mb, total_mb) = get_disk_space_info(".");
        disks.push(SystemDiskInfo {
            mountpoint: "C:".to_string(),
            drive_type: "fixed".to_string(),
            total_mb: total_mb as i64,
            free_mb: free_mb as i64,
        });
    }

    disks
}

#[cfg(not(target_os = "windows"))]
pub fn get_system_disks() -> Vec<SystemDiskInfo> {
    let (free_mb, total_mb) = get_disk_space_info(".");
    vec![SystemDiskInfo {
        mountpoint: if cfg!(target_os = "android") {
            "/data".to_string()
        } else {
            "/".to_string()
        },
        drive_type: "fixed".to_string(),
        total_mb: total_mb as i64,
        free_mb: free_mb as i64,
    }]
}

#[cfg(target_os = "windows")]
pub fn get_display_bpp() -> u32 {
    use windows_sys::Win32::Graphics::Gdi::{GetDC, GetDeviceCaps, ReleaseDC, BITSPIXEL};
    unsafe {
        let hdc = GetDC(std::ptr::null_mut());
        if !hdc.is_null() {
            let bpp = GetDeviceCaps(hdc, BITSPIXEL as i32);
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
fn get_power_status(q: &str) -> String {
    use windows_sys::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};
    let sub = q.strip_prefix("system.power.").unwrap_or(q);
    let mut status: SYSTEM_POWER_STATUS = unsafe { std::mem::zeroed() };
    if unsafe { GetSystemPowerStatus(&mut status) } != 0 {
        match sub {
            "source" => match status.ACLineStatus {
                1 => "ac".to_string(),
                0 => "battery".to_string(),
                _ => "unknown".to_string(),
            },
            "battery.percent" => {
                if status.BatteryLifePercent <= 100 {
                    status.BatteryLifePercent.to_string()
                } else {
                    "-1".to_string()
                }
            }
            "battery.lifetime" => {
                if status.BatteryLifeTime != u32::MAX && status.BatteryLifeTime != 0 {
                    status.BatteryLifeTime.to_string()
                } else {
                    "-1".to_string()
                }
            }
            "battery.flag" => {
                if status.BatteryFlag == 128 {
                    "no_battery".to_string()
                } else if status.BatteryFlag == 255 {
                    String::new()
                } else {
                    let mut flags = Vec::new();
                    if (status.BatteryFlag & 8) != 0 {
                        flags.push("charging");
                    }
                    if (status.BatteryFlag & 1) != 0 {
                        flags.push("high");
                    } else if (status.BatteryFlag & 2) != 0 {
                        flags.push("low");
                    } else if (status.BatteryFlag & 4) != 0 {
                        flags.push("critical");
                    }
                    flags.join(",")
                }
            }
            _ => "unknown".to_string(),
        }
    } else {
        match sub {
            "source" => "unknown".to_string(),
            "battery.percent" | "battery.lifetime" => "-1".to_string(),
            "battery.flag" => String::new(),
            _ => "unknown".to_string(),
        }
    }
}

#[cfg(target_os = "android")]
fn get_power_status(q: &str) -> String {
    let sub = q.strip_prefix("system.power.").unwrap_or(q);
    let mut is_charging = false;
    if let Ok(status) = std::fs::read_to_string("/sys/class/power_supply/battery/status") {
        let s = status.trim().to_lowercase();
        if s == "charging" || s == "full" {
            is_charging = true;
        }
    }
    let capacity = std::fs::read_to_string("/sys/class/power_supply/battery/capacity")
        .ok()
        .and_then(|c| c.trim().parse::<u32>().ok());

    match sub {
        "source" => {
            if is_charging {
                "ac".to_string()
            } else if capacity.is_some() {
                "battery".to_string()
            } else {
                "unknown".to_string()
            }
        }
        "battery.percent" => capacity.map(|c| c.to_string()).unwrap_or_else(|| "-1".to_string()),
        "battery.lifetime" => "-1".to_string(),
        "battery.flag" => {
            if let Some(pct) = capacity {
                let mut flags = Vec::new();
                if is_charging {
                    flags.push("charging");
                }
                if pct > 66 {
                    flags.push("high");
                } else if pct > 15 {
                    flags.push("low");
                } else {
                    flags.push("critical");
                }
                flags.join(",")
            } else {
                "no_battery".to_string()
            }
        }
        _ => "unknown".to_string(),
    }
}

#[cfg(all(not(target_os = "windows"), not(target_os = "android")))]
fn get_power_status(q: &str) -> String {
    let sub = q.strip_prefix("system.power.").unwrap_or(q);
    let mut is_ups = false;
    let mut is_ac = false;

    if let Ok(entries) = std::fs::read_dir("/sys/class/power_supply") {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Ok(ps_type) = std::fs::read_to_string(path.join("type")) {
                let t = ps_type.trim().to_lowercase();
                if t == "ups" {
                    is_ups = true;
                } else if t == "mains" {
                    if let Ok(online) = std::fs::read_to_string(path.join("online")) {
                        if online.trim() == "1" {
                            is_ac = true;
                        }
                    }
                }
            }
        }
    }

    match sub {
        "source" => {
            if is_ups {
                "ups".to_string()
            } else if is_ac {
                "ac".to_string()
            } else {
                "unknown".to_string()
            }
        }
        "battery.percent" | "battery.lifetime" => "-1".to_string(),
        "battery.flag" => "no_battery".to_string(),
        _ => "unknown".to_string(),
    }
}

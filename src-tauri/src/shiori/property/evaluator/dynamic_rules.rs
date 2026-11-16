//! 接頭辞・パターン一致型動的プロパティ評価モジュール

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
        return match sub {
            "name" | "version" => std::env::consts::OS.to_string(),
            _ => std::env::consts::OS.to_string(),
        };
    }
    if let Some(sub) = q.strip_prefix("system.cpu.") {
        return match sub {
            "num" => std::thread::available_parallelism()
                .map(|n| n.get().to_string())
                .unwrap_or_else(|_| "1".to_string()),
            "vendor" | "name" => std::env::consts::ARCH.to_string(),
            "load" => "0".to_string(),
            "clock" => "0".to_string(),
            "features" => std::env::consts::ARCH.to_string(),
            _ => std::env::consts::ARCH.to_string(),
        };
    }
    if let Some(sub) = q.strip_prefix("system.memory.") {
        let (free_mb, total_mb) = get_memory_info_mb();
        return match sub {
            "free" | "available" => free_mb.to_string(),
            "total" => total_mb.to_string(),
            "used" => total_mb.saturating_sub(free_mb).to_string(),
            _ => total_mb.to_string(),
        };
    }
    if q.starts_with("system.power.") {
        return get_power_status();
    }
    if q.starts_with("system.network.") {
        return "online".to_string();
    }

    // UKADOC spec: system.monitor.count & system.monitor.index(ID).(rect|work|dpi|bpp|primary)
    if q == "system.monitor.count" {
        return monitors.len().max(1).to_string();
    }
    if let Some(mon_prop) = q.strip_prefix("system.monitor.index(")
        && let Some(idx) = mon_prop.find(").")
    {
        let mon_id = mon_prop[..idx].parse::<usize>().unwrap_or(0);
        let subkey = &mon_prop[idx + 2..];
        if let Some(mon) = monitors.get(mon_id) {
            return match subkey {
                "rect" => format!("{},{},{},{}", mon.left, mon.top, mon.right, mon.bottom),
                "work" => format!(
                    "{},{},{},{}",
                    mon.left,
                    mon.top,
                    mon.right,
                    (mon.bottom - 40).max(mon.top)
                ),
                "dpi" => format!("{:.0}", mon.scale_factor * 96.0),
                "bpp" => "32".to_string(),
                "primary" => {
                    if mon.is_primary {
                        "1".to_string()
                    } else {
                        "0".to_string()
                    }
                }
                _ => "0".to_string(),
            };
        } else if mon_id == 0 {
            return match subkey {
                "rect" => "0,0,1920,1080".to_string(),
                "work" => "0,0,1920,1040".to_string(),
                "dpi" => "96".to_string(),
                "bpp" => "32".to_string(),
                "primary" => "1".to_string(),
                _ => "0".to_string(),
            };
        } else {
            return "0".to_string();
        }
    }

    // UKADOC spec: system.disk.count & system.disk.index(ID).(mountpoint|type|total|free)
    if q == "system.disk.count" {
        return "1".to_string();
    }
    if let Some(disk_prop) = q.strip_prefix("system.disk.index(")
        && let Some(idx) = disk_prop.find(").")
    {
        let disk_id = disk_prop[..idx].parse::<usize>().unwrap_or(0);
        let subkey = &disk_prop[idx + 2..];
        let (free_mb, total_mb) = get_disk_space_info(".");
        return match subkey {
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
        };
    }

    if let Some(scope_prop) = q.strip_prefix("currentghost.scope(")
        && let Some(idx) = scope_prop.find(").")
    {
        let scope_id = scope_prop[..idx].parse::<u32>().unwrap_or(0);
        let subprop = &scope_prop[idx + 2..];
        return match subprop {
            "name" => match scope_id {
                0 => "Sakura".to_string(),
                1 => "Kero".to_string(),
                n => format!("Char{}", n),
            },
            "rect" => "0,0,280,300".to_string(),
            "x" | "y" => "0".to_string(),
            "scaling" => "100".to_string(),
            "surface.num" => "0".to_string(),
            "seriko.defaultsurface" => "0".to_string(),
            _ => "0".to_string(),
        };
    }
    if let Some(scope_prop) = q.strip_prefix("currentghost.balloon.scope(")
        && let Some(idx) = scope_prop.find(").")
    {
        let subprop = &scope_prop[idx + 2..];
        return match subprop {
            "x" | "y" | "basepos.x" | "basepos.y" => "0".to_string(),
            "rect" => "0,0,280,100".to_string(),
            "num" | "count" => "1".to_string(),
            "lines" | "lines.initial" => "4".to_string(),
            "validwidth" | "validwidth.initial" => "260".to_string(),
            "validheight" | "validheight.initial" => "80".to_string(),
            "char_width" => "12".to_string(),
            "background.color" => "255,255,255".to_string(),
            "vertical" => "0".to_string(),
            "scaling" => "100".to_string(),
            _ => "0".to_string(),
        };
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

#[cfg(not(target_os = "windows"))]
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

#[cfg(not(target_os = "windows"))]
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

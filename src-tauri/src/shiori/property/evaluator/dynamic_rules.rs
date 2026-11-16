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

    // UKADOC spec: system.os.(type|arch|name|version|build|parenttype|parentname|locale|locale.language|locale.country|timezone.offset|dst|uptime|unixtime|idletime)
    if let Some(sub) = q.strip_prefix("system.os.") {
        return match sub {
            "type" => {
                if cfg!(target_os = "windows") {
                    "Windows".to_string()
                } else if cfg!(target_os = "macos") {
                    "MacOS".to_string()
                } else if cfg!(target_os = "linux") {
                    "Linux".to_string()
                } else if cfg!(target_os = "ios") {
                    "iOS".to_string()
                } else if cfg!(target_os = "android") {
                    "Android".to_string()
                } else if cfg!(target_os = "freebsd") {
                    "FreeBSD".to_string()
                } else if check_reactos() {
                    "ReactOS".to_string()
                } else {
                    "Web".to_string()
                }
            }
            "arch" => match std::env::consts::ARCH {
                "x86_64" => "x64".to_string(),
                "aarch64" => "arm64".to_string(),
                "x86" => "x86".to_string(),
                "arm" => "arm".to_string(),
                "riscv32" | "riscv64" | "riscv64gc" => "risc-v".to_string(),
                "powerpc" | "powerpc64" | "powerpc64le" => "ppc".to_string(),
                "mips" | "mips64" | "mipsel" | "mips64el" => "mips".to_string(),
                "loongarch64" => "loongarch".to_string(),
                "ia64" => "ia64".to_string(),
                "sparc" | "sparc64" => "sparc".to_string(),
                "s390x" => "s390x".to_string(),
                "wasm32" | "wasm64" => "unknown".to_string(),
                other => {
                    if other.is_empty() {
                        "unknown".to_string()
                    } else {
                        other.to_string()
                    }
                }
            },
            "name" => {
                let (ver, build) = get_os_ver_and_build();
                if cfg!(target_os = "windows") {
                    if build >= 22000 {
                        format!("Windows 11 (Build {})", build)
                    } else {
                        format!("Windows 10 (Build {})", build)
                    }
                } else if cfg!(target_os = "android") {
                    "Android OS".to_string()
                } else {
                    format!("Linux {} ({})", ver, std::env::consts::ARCH)
                }
            }
            "version" => {
                let (ver, _) = get_os_ver_and_build();
                ver
            }
            "build" => {
                let (_, build) = get_os_ver_and_build();
                build.to_string()
            }
            "parenttype" => check_wine_parent().0,
            "parentname" => check_wine_parent().1,
            "locale" => sys_locale::get_locale().unwrap_or_else(|| "ja-JP".to_string()),
            "locale.language" => {
                let loc = sys_locale::get_locale().unwrap_or_else(|| "ja-JP".to_string());
                loc.split(&['-', '_'][..])
                    .next()
                    .unwrap_or("ja")
                    .to_string()
            }
            "locale.country" => {
                let loc = sys_locale::get_locale().unwrap_or_else(|| "ja-JP".to_string());
                loc.split(&['-', '_'][..])
                    .nth(1)
                    .unwrap_or("JP")
                    .to_string()
            }
            "timezone.offset" => {
                use chrono::Offset;
                let now = chrono::Local::now();
                let offset_secs = now.offset().fix().local_minus_utc();
                let offset_mins = offset_secs / 60;
                // UKADOC spec: "UTCに対して進んでいる地域では負の値になる。" (e.g. JST UTC+9 -> -540)
                (-offset_mins).to_string()
            }
            "dst" => "0".to_string(),
            "uptime" => get_system_uptime_secs().to_string(),
            "unixtime" => chrono::Utc::now().timestamp().to_string(),
            "idletime" => get_user_idle_time_secs().to_string(),
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
                "work" => {
                    if mon.is_primary {
                        let work = get_primary_work_area_rect();
                        format!("{},{},{},{}", work.0, work.1, work.2, work.3)
                    } else {
                        format!(
                            "{},{},{},{}",
                            mon.left,
                            mon.top,
                            mon.right,
                            (mon.bottom - 40).max(mon.top)
                        )
                    }
                }
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
            };
        } else if mon_id == 0 {
            let work = get_primary_work_area_rect();
            let bpp = get_display_bpp();
            return match subkey {
                "rect" => "0,0,1920,1080".to_string(),
                "work" => format!("{},{},{},{}", work.0, work.1, work.2, work.3),
                "dpi" => "96".to_string(),
                "bpp" => bpp.to_string(),
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
fn get_os_ver_and_build() -> (String, u32) {
    use windows_sys::Win32::System::SystemInformation::OSVERSIONINFOEXW;
    type RtlGetVersionFn = unsafe extern "system" fn(*mut OSVERSIONINFOEXW) -> i32;
    unsafe {
        let ntdll =
            windows_sys::Win32::System::LibraryLoader::GetModuleHandleA(b"ntdll.dll\0".as_ptr());
        if ntdll != 0 {
            let proc = windows_sys::Win32::System::LibraryLoader::GetProcAddress(
                ntdll,
                b"RtlGetVersion\0".as_ptr(),
            );
            if let Some(rtl_get_version) = proc {
                let rtl_get_version: RtlGetVersionFn = std::mem::transmute(rtl_get_version);
                let mut info: OSVERSIONINFOEXW = std::mem::zeroed();
                info.dwOSVersionInfoSize = std::mem::size_of::<OSVERSIONINFOEXW>() as u32;
                if rtl_get_version(&mut info) == 0 {
                    let ver = format!("{}.{}", info.dwMajorVersion, info.dwMinorVersion);
                    return (ver, info.dwBuildNumber);
                }
            }
        }
    }
    ("10.0".to_string(), 22621)
}

#[cfg(not(target_os = "windows"))]
fn get_os_ver_and_build() -> (String, u32) {
    ("1.0".to_string(), 0)
}

#[cfg(target_os = "windows")]
fn check_wine_parent() -> (String, String) {
    unsafe {
        let ntdll =
            windows_sys::Win32::System::LibraryLoader::GetModuleHandleA(b"ntdll.dll\0".as_ptr());
        if ntdll != 0 {
            let proc = windows_sys::Win32::System::LibraryLoader::GetProcAddress(
                ntdll,
                b"wine_get_version\0".as_ptr(),
            );
            if proc.is_some() {
                return ("Wine".to_string(), "Linux".to_string());
            }
        }
    }
    (String::new(), String::new())
}

#[cfg(not(target_os = "windows"))]
fn check_wine_parent() -> (String, String) {
    (String::new(), String::new())
}

#[cfg(target_os = "windows")]
fn get_user_idle_time_secs() -> u64 {
    use windows_sys::Win32::UI::WindowsAndMessaging::{GetLastInputInfo, LASTINPUTINFO};
    unsafe {
        let mut info: LASTINPUTINFO = std::mem::zeroed();
        info.cbSize = std::mem::size_of::<LASTINPUTINFO>() as u32;
        if GetLastInputInfo(&mut info) != 0 {
            let now = windows_sys::Win32::System::SystemInformation::GetTickCount64();
            let idle_ms = now.saturating_sub(info.dwTime as u64);
            return idle_ms / 1000;
        }
    }
    0
}

#[cfg(not(target_os = "windows"))]
fn get_user_idle_time_secs() -> u64 {
    0
}

#[cfg(target_os = "windows")]
fn get_system_uptime_secs() -> u64 {
    unsafe { windows_sys::Win32::System::SystemInformation::GetTickCount64() / 1000 }
}

#[cfg(not(target_os = "windows"))]
fn get_system_uptime_secs() -> u64 {
    if let Ok(content) = std::fs::read_to_string("/proc/uptime") {
        if let Some(first) = content.split_whitespace().next() {
            if let Ok(secs) = first.parse::<f64>() {
                return secs as u64;
            }
        }
    }
    0
}

#[cfg(target_os = "windows")]
pub(super) fn get_display_bpp() -> u32 {
    use windows_sys::Win32::Graphics::Gdi::{BITSPIXEL, GetDC, GetDeviceCaps, ReleaseDC};
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
pub(super) fn get_display_bpp() -> u32 {
    32
}

#[cfg(target_os = "windows")]
fn get_primary_work_area_rect() -> (i32, i32, i32, i32) {
    use windows_sys::Win32::Foundation::RECT;
    use windows_sys::Win32::UI::WindowsAndMessaging::{SPI_GETWORKAREA, SystemParametersInfoW};
    let mut rect: RECT = unsafe { std::mem::zeroed() };
    if unsafe { SystemParametersInfoW(SPI_GETWORKAREA, 0, &mut rect as *mut _ as *mut _, 0) } != 0 {
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

fn check_reactos() -> bool {
    if std::env::var_os("REACTOS").is_some() || std::env::var_os("ReactOS").is_some() {
        return true;
    }
    #[cfg(target_os = "windows")]
    {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;
        use windows_sys::Win32::System::Registry::{
            HKEY_LOCAL_MACHINE, KEY_READ, RegOpenKeyExW, RegQueryValueExW,
        };
        let subkey: Vec<u16> = OsStr::new("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();
        let val_name: Vec<u16> = OsStr::new("ProductName")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();
        let mut hkey = 0isize;
        if unsafe { RegOpenKeyExW(HKEY_LOCAL_MACHINE, subkey.as_ptr(), 0, KEY_READ, &mut hkey) }
            == 0
        {
            let mut buf = [0u8; 256];
            let mut buf_len = buf.len() as u32;
            if unsafe {
                RegQueryValueExW(
                    hkey,
                    val_name.as_ptr(),
                    std::ptr::null_mut(),
                    std::ptr::null_mut(),
                    buf.as_mut_ptr(),
                    &mut buf_len,
                )
            } == 0
            {
                let name = String::from_utf8_lossy(&buf[..buf_len as usize]);
                if name.to_lowercase().contains("reactos") {
                    return true;
                }
            }
        }
    }
    false
}

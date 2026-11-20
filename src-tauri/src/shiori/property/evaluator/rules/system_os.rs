//! system.os.* プロパティ評価モジュール

pub fn evaluate_system_os(sub: &str) -> String {
    match sub {
        "type" => {
            if check_reactos() {
                "ReactOS".to_string()
            } else if cfg!(target_os = "windows") {
                "Windows".to_string()
            } else if cfg!(target_os = "ios") {
                "iOS".to_string()
            } else if cfg!(target_os = "macos") {
                "MacOS".to_string()
            } else if cfg!(target_os = "android") {
                "Android".to_string()
            } else if cfg!(target_os = "linux") {
                "Linux".to_string()
            } else if cfg!(target_os = "freebsd") {
                "FreeBSD".to_string()
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
            let (ver, build, major, minor) = get_os_ver_and_build();
            if cfg!(target_os = "windows") {
                let os_name = match (major, minor) {
                    (10, 0) => {
                        if build >= 22000 {
                            "Windows 11"
                        } else {
                            "Windows 10"
                        }
                    }
                    (6, 3) => "Windows 8.1",
                    (6, 2) => "Windows 8",
                    (6, 1) => "Windows 7",
                    (6, 0) => "Windows Vista",
                    (5, 1) | (5, 2) => "Windows XP",
                    _ => "Windows",
                };
                let disp_ver = get_windows_display_version();
                if !disp_ver.is_empty() {
                    format!("{} {}", os_name, disp_ver)
                } else {
                    format!("{} (Build {})", os_name, build)
                }
            } else if cfg!(target_os = "android") {
                let model = get_android_property("ro.product.model").unwrap_or_default();
                if !model.is_empty() {
                    format!("Android {} ({})", ver, model)
                } else {
                    format!("Android {}", ver)
                }
            } else if cfg!(target_os = "macos") {
                format!("macOS {}", ver)
            } else if cfg!(target_os = "ios") {
                format!("iOS {}", ver)
            } else {
                format!("Linux {} ({})", ver, std::env::consts::ARCH)
            }
        }
        "version" => {
            let (ver, _, _, _) = get_os_ver_and_build();
            ver
        }
        "build" => {
            let (_, build, _, _) = get_os_ver_and_build();
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
            let now = jiff::ZonedDateTime::now();
            let offset_secs = now.offset().seconds();
            let offset_mins = offset_secs / 60;
            (-offset_mins).to_string()
        }
        "dst" => {
            if is_dst_active() {
                "1".to_string()
            } else {
                "0".to_string()
            }
        }
        "uptime" => get_system_uptime_secs().to_string(),
        "unixtime" => jiff::Timestamp::now().as_second().to_string(),
        "idletime" => get_user_idle_time_secs().to_string(),
        "dnd.mode" => get_system_dnd_mode(),
        _ => std::env::consts::OS.to_string(),
    }
}

pub fn evaluate_theme_mode(is_os_mode: bool) -> String {
    get_theme_mode(is_os_mode)
}

pub fn get_android_property(prop_name: &str) -> Option<String> {
    if let Ok(content) = std::fs::read_to_string("/system/build.prop") {
        for line in content.lines() {
            if let Some((k, v)) = line.split_once('=')
                && k.trim() == prop_name
            {
                return Some(v.trim().to_string());
            }
        }
    }
    None
}

#[cfg(target_os = "windows")]
fn get_os_ver_and_build() -> (String, u32, u32, u32) {
    use windows_sys::Win32::System::SystemInformation::OSVERSIONINFOEXW;
    type RtlGetVersionFn = unsafe extern "system" fn(*mut OSVERSIONINFOEXW) -> i32;
    unsafe {
        let ntdll =
            windows_sys::Win32::System::LibraryLoader::GetModuleHandleA(b"ntdll.dll\0".as_ptr());
        if !ntdll.is_null() {
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
                    return (
                        ver,
                        info.dwBuildNumber,
                        info.dwMajorVersion,
                        info.dwMinorVersion,
                    );
                }
            }
        }
    }
    ("10.0".to_string(), 22621, 10, 0)
}

#[cfg(target_os = "android")]
fn get_os_ver_and_build() -> (String, u32, u32, u32) {
    let release =
        get_android_property("ro.build.version.release").unwrap_or_else(|| "14".to_string());
    let sdk_str = get_android_property("ro.build.version.sdk").unwrap_or_else(|| "34".to_string());
    let sdk = sdk_str.parse::<u32>().unwrap_or(34);
    (release, sdk, sdk, 0)
}

#[cfg(not(any(target_os = "windows", target_os = "android")))]
fn get_os_ver_and_build() -> (String, u32, u32, u32) {
    use std::ffi::CStr;
    let mut uts: libc::utsname = unsafe { std::mem::zeroed() };
    if unsafe { libc::uname(&mut uts) } == 0 {
        let release = unsafe { CStr::from_ptr(uts.release.as_ptr()) }
            .to_string_lossy()
            .to_string();
        let build = release
            .split(&['.', '-'][..])
            .filter_map(|s| s.parse::<u32>().ok())
            .last()
            .unwrap_or(0);
        return (release, build, 0, 0);
    }
    ("1.0".to_string(), 0, 0, 0)
}

#[cfg(target_os = "windows")]
fn check_wine_parent() -> (String, String) {
    unsafe {
        let ntdll =
            windows_sys::Win32::System::LibraryLoader::GetModuleHandleA(b"ntdll.dll\0".as_ptr());
        if !ntdll.is_null() {
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
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
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

fn check_reactos() -> bool {
    if std::env::var_os("REACTOS").is_some() || std::env::var_os("ReactOS").is_some() {
        return true;
    }
    #[cfg(target_os = "windows")]
    {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;
        use windows_sys::Win32::System::Registry::{
            HKEY, HKEY_LOCAL_MACHINE, KEY_READ, RegOpenKeyExW, RegQueryValueExW,
        };
        let subkey: Vec<u16> = OsStr::new("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();
        let val_name: Vec<u16> = OsStr::new("ProductName")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();
        let mut hkey: HKEY = std::ptr::null_mut();
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

#[cfg(target_os = "windows")]
fn get_windows_display_version() -> String {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::System::Registry::{
        HKEY, HKEY_LOCAL_MACHINE, KEY_READ, RegOpenKeyExW, RegQueryValueExW,
    };
    let subkey: Vec<u16> = OsStr::new("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion")
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let val_name: Vec<u16> = OsStr::new("DisplayVersion")
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let mut hkey: HKEY = std::ptr::null_mut();
    if unsafe { RegOpenKeyExW(HKEY_LOCAL_MACHINE, subkey.as_ptr(), 0, KEY_READ, &mut hkey) } == 0 {
        let mut buf = [0u16; 128];
        let mut buf_bytes = (buf.len() * 2) as u32;
        if unsafe {
            RegQueryValueExW(
                hkey,
                val_name.as_ptr(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                buf.as_mut_ptr() as *mut u8,
                &mut buf_bytes,
            )
        } == 0
        {
            let len = (buf_bytes as usize / 2).saturating_sub(1);
            let version_str = String::from_utf16_lossy(&buf[..len]).trim().to_string();
            if !version_str.is_empty() {
                return version_str;
            }
        }
    }
    String::new()
}

#[cfg(not(target_os = "windows"))]
fn get_windows_display_version() -> String {
    String::new()
}

#[cfg(target_os = "windows")]
fn is_dst_active() -> bool {
    use windows_sys::Win32::System::Time::{GetTimeZoneInformation, TIME_ZONE_INFORMATION};
    let mut tzi: TIME_ZONE_INFORMATION = unsafe { std::mem::zeroed() };
    let res = unsafe { GetTimeZoneInformation(&mut tzi) };
    res == 2
}

#[cfg(not(target_os = "windows"))]
fn is_dst_active() -> bool {
    let now = unsafe { libc::time(std::ptr::null_mut()) };
    let mut tm: libc::tm = unsafe { std::mem::zeroed() };
    if !unsafe { libc::localtime_r(&now, &mut tm) }.is_null() {
        return tm.tm_isdst > 0;
    }
    false
}

#[cfg(target_os = "windows")]
fn get_theme_mode(is_os_mode: bool) -> String {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::System::Registry::{
        HKEY, HKEY_CURRENT_USER, KEY_READ, RegOpenKeyExW, RegQueryValueExW,
    };
    let subkey: Vec<u16> =
        OsStr::new("Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();
    let val_name_str = if is_os_mode {
        "SystemUsesLightTheme"
    } else {
        "AppsUseLightTheme"
    };
    let val_name: Vec<u16> = OsStr::new(val_name_str)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let mut hkey: HKEY = std::ptr::null_mut();
    if unsafe { RegOpenKeyExW(HKEY_CURRENT_USER, subkey.as_ptr(), 0, KEY_READ, &mut hkey) } == 0 {
        let mut light = 0u32;
        let mut light_bytes = std::mem::size_of::<u32>() as u32;
        if unsafe {
            RegQueryValueExW(
                hkey,
                val_name.as_ptr(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                &mut light as *mut u32 as *mut u8,
                &mut light_bytes,
            )
        } == 0
        {
            if light == 0 {
                return "dark".to_string();
            } else {
                return "light".to_string();
            }
        }
    }
    "dark".to_string()
}

#[cfg(not(target_os = "windows"))]
fn get_theme_mode(_is_os_mode: bool) -> String {
    "dark".to_string()
}

#[cfg(target_os = "windows")]
pub fn get_system_dnd_mode() -> String {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::System::Registry::{
        HKEY, HKEY_CURRENT_USER, KEY_READ, RegOpenKeyExW, RegQueryValueExW,
    };
    let subkey: Vec<u16> = OsStr::new("Software\\Microsoft\\Windows\\CurrentVersion\\FocusAssist")
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let val_name: Vec<u16> = OsStr::new("Value")
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let mut hkey: HKEY = std::ptr::null_mut();
    if unsafe { RegOpenKeyExW(HKEY_CURRENT_USER, subkey.as_ptr(), 0, KEY_READ, &mut hkey) } == 0 {
        let mut fa_value = 0u32;
        let mut fa_bytes = std::mem::size_of::<u32>() as u32;
        if unsafe {
            RegQueryValueExW(
                hkey,
                val_name.as_ptr(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                &mut fa_value as *mut u32 as *mut u8,
                &mut fa_bytes,
            )
        } == 0
            && fa_value > 0
        {
            return "quiet".to_string();
        }
    }
    "normal".to_string()
}

#[cfg(not(target_os = "windows"))]
pub fn get_system_dnd_mode() -> String {
    "normal".to_string()
}

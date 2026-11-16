//! system.cpu.* プロパティ評価モジュール

pub fn evaluate_system_cpu(sub: &str) -> String {
    match sub {
        "num" => std::thread::available_parallelism()
            .map(|n| n.get().to_string())
            .unwrap_or_else(|_| "1".to_string()),
        "vendor" | "name" => std::env::consts::ARCH.to_string(),
        "load" => get_cpu_load_percent().to_string(),
        "clock" => get_cpu_clock_mhz().to_string(),
        "features" => std::env::consts::ARCH.to_string(),
        _ => std::env::consts::ARCH.to_string(),
    }
}

#[cfg(target_os = "windows")]
fn get_cpu_load_percent() -> u32 {
    use windows_sys::Win32::Foundation::FILETIME;
    use windows_sys::Win32::System::Threading::GetSystemTimes;
    let mut idle: FILETIME = unsafe { std::mem::zeroed() };
    let mut kernel: FILETIME = unsafe { std::mem::zeroed() };
    let mut user: FILETIME = unsafe { std::mem::zeroed() };
    if unsafe { GetSystemTimes(&mut idle, &mut kernel, &mut user) } != 0 {
        let filetime_to_u64 =
            |ft: FILETIME| ((ft.dwHighDateTime as u64) << 32) | (ft.dwLowDateTime as u64);
        let idle_u = filetime_to_u64(idle);
        let kernel_u = filetime_to_u64(kernel);
        let user_u = filetime_to_u64(user);
        let total = kernel_u.saturating_add(user_u);
        if total > 0 {
            let busy = total.saturating_sub(idle_u);
            let percent = (busy * 100) / total;
            return (percent as u32).min(100);
        }
    }
    0
}

#[cfg(not(target_os = "windows"))]
fn get_cpu_load_percent() -> u32 {
    if let Ok(content) = std::fs::read_to_string("/proc/loadavg") {
        if let Some(first) = content.split_whitespace().next() {
            if let Ok(load_1min) = first.parse::<f32>() {
                let cpus = std::thread::available_parallelism()
                    .map(|n| n.get())
                    .unwrap_or(1) as f32;
                let percent = (load_1min / cpus * 100.0) as u32;
                return percent.min(100);
            }
        }
    }
    0
}

#[cfg(target_os = "windows")]
fn get_cpu_clock_mhz() -> u32 {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::System::Registry::{
        HKEY, HKEY_LOCAL_MACHINE, KEY_READ, RegOpenKeyExW, RegQueryValueExW,
    };
    let subkey: Vec<u16> = OsStr::new("HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0")
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let val_name: Vec<u16> = OsStr::new("~MHz")
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let mut hkey: HKEY = std::ptr::null_mut();
    if unsafe { RegOpenKeyExW(HKEY_LOCAL_MACHINE, subkey.as_ptr(), 0, KEY_READ, &mut hkey) } == 0 {
        let mut mhz = 0u32;
        let mut mhz_bytes = std::mem::size_of::<u32>() as u32;
        if unsafe {
            RegQueryValueExW(
                hkey,
                val_name.as_ptr(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                &mut mhz as *mut u32 as *mut u8,
                &mut mhz_bytes,
            )
        } == 0
            && mhz > 0
        {
            return mhz;
        }
    }
    2400
}

#[cfg(not(target_os = "windows"))]
fn get_cpu_clock_mhz() -> u32 {
    if let Ok(content) =
        std::fs::read_to_string("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq")
    {
        if let Ok(khz) = content.trim().parse::<u32>() {
            return khz / 1000;
        }
    }
    if let Ok(content) = std::fs::read_to_string("/proc/cpuinfo") {
        for line in content.lines() {
            if line.contains("cpu MHz") || line.contains("BogoMIPS") {
                if let Some(val) = line.split(':').nth(1) {
                    if let Ok(mhz) = val.trim().parse::<f32>() {
                        return mhz as u32;
                    }
                }
            }
        }
    }
    2400
}

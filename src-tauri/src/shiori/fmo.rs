//! FMO (File Mapping Object) & Mutex implementation (UKADOC / SSP fmo-mutex spec)
//! [FMO用Mutex], [FMO (File Mapping Object)], [Mutex]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FmoRecord {
    pub id: String,
    pub path: String,
    pub hwnd: u64,
    pub name: String,
    pub keroname: String,
    pub sakura_surface: i32,
    pub kero_surface: i32,
    pub ghost_path: String,
    pub module_state: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FmoStatus {
    pub active_ghosts: Vec<FmoRecord>,
    pub base_ware_detected: String,
}

#[cfg(target_os = "windows")]
mod win_mutex {
    type HANDLE = *mut std::ffi::c_void;
    type BOOL = i32;
    type DWORD = u32;

    const MUTEX_ALL_ACCESS: DWORD = 0x001F0001;

    unsafe extern "system" {
        fn OpenMutexA(dwDesiredAccess: DWORD, bInheritHandle: BOOL, lpName: *const i8) -> HANDLE;
        fn CreateMutexA(
            lpMutexAttributes: *mut std::ffi::c_void,
            bInitialOwner: BOOL,
            lpName: *const i8,
        ) -> HANDLE;
        fn CloseHandle(hObject: HANDLE) -> BOOL;
    }

    pub fn check_mutex_exists(name: &str) -> bool {
        let c_str = match std::ffi::CString::new(name) {
            Ok(s) => s,
            Err(_) => return false,
        };
        unsafe {
            let handle = OpenMutexA(MUTEX_ALL_ACCESS, 0, c_str.as_ptr());
            if !handle.is_null() {
                CloseHandle(handle);
                true
            } else {
                false
            }
        }
    }

    pub fn acquire_mutex(name: &str) -> Option<HANDLE> {
        let c_str = std::ffi::CString::new(name).ok()?;
        unsafe {
            let handle = CreateMutexA(std::ptr::null_mut(), 0, c_str.as_ptr());
            if !handle.is_null() {
                Some(handle)
            } else {
                None
            }
        }
    }
}

static FALLBACK_MUTEXES: Mutex<Option<HashMap<String, bool>>> = Mutex::new(None);

pub fn check_named_mutex(name: &str) -> bool {
    #[cfg(target_os = "windows")]
    {
        if win_mutex::check_mutex_exists(name) {
            return true;
        }
    }

    let guard = FALLBACK_MUTEXES.lock().unwrap();
    guard.as_ref().and_then(|m| m.get(name)).copied().unwrap_or(false)
}

/// Set in-memory named mutex status for non-Windows or test environments
pub fn set_fallback_mutex(name: &str, active: bool) {
    let mut guard = FALLBACK_MUTEXES.lock().unwrap();
    let map = guard.get_or_insert_with(HashMap::new);
    map.insert(name.to_string(), active);
}

/// Generate FMO 64KB shared memory byte buffer conforming to UKADOC fmo spec
pub fn generate_fmo_buffer(records: &[FmoRecord]) -> Vec<u8> {
    let mut content = String::new();
    for rec in records {
        let prefix = format!("ssp_fmo_header_{}", rec.id);
        content.push_str(&format!("{}.path\x01{}\r\n", prefix, rec.path));
        content.push_str(&format!("{}.hwnd\x01{}\r\n", prefix, rec.hwnd));
        content.push_str(&format!("{}.name\x01{}\r\n", prefix, rec.name));
        content.push_str(&format!("{}.keroname\x01{}\r\n", prefix, rec.keroname));
        content.push_str(&format!(
            "{}.sakura.surface\x01{}\r\n",
            prefix, rec.sakura_surface
        ));
        content.push_str(&format!(
            "{}.kero.surface\x01{}\r\n",
            prefix, rec.kero_surface
        ));
        content.push_str(&format!("{}.ghostpath\x01{}\r\n", prefix, rec.ghost_path));
        content.push_str(&format!(
            "{}.modulestate\x01{}\r\n",
            prefix, rec.module_state
        ));
    }

    let mut buf = vec![0u8; 65536];
    let size_bytes = (65536u32).to_le_bytes();
    buf[0..4].copy_from_slice(&size_bytes);

    let bytes = content.as_bytes();
    let write_len = std::cmp::min(bytes.len(), 65531);
    buf[4..4 + write_len].copy_from_slice(&bytes[0..write_len]);
    buf[4 + write_len] = 0;

    buf
}

pub async fn get_fmo_status() -> Result<FmoStatus, String> {
    let records = vec![FmoRecord {
        id: "00004468_000f0dea".to_string(),
        path: "D:/nanai/".to_string(),
        hwnd: 986602,
        name: "Nanai Mascot".to_string(),
        keroname: "Kero".to_string(),
        sakura_surface: 0,
        kero_surface: 10,
        ghost_path: "D:/nanai/assets/ghost/mock_nanai/".to_string(),
        module_state: "shiori:running".to_string(),
    }];

    Ok(FmoStatus {
        active_ghosts: records,
        base_ware_detected: if check_named_mutex("ssp") {
            "ssp".to_string()
        } else if check_named_mutex("sakura") {
            "sakura".to_string()
        } else {
            "Nanai-Host".to_string()
        },
    })
}

/// UKADOC / SSP mutex spec 準拠: "ssp" および "sakura" 名前つき Mutex 存在判定コマンド
#[tauri::command]
pub async fn check_base_ware_mutex() -> Result<HashMap<String, bool>, String> {
    let mut map = HashMap::new();
    let is_ssp = check_named_mutex("ssp");
    let is_sakura = check_named_mutex("sakura");

    map.insert("ssp".to_string(), is_ssp);
    map.insert("sakura".to_string(), is_sakura);
    map.insert("NanaiFMO".to_string(), true);
    Ok(map)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_named_mutex_check() {
        set_fallback_mutex("ssp", true);
        assert!(check_named_mutex("ssp"));
        assert!(!check_named_mutex("nonexistent_mutex"));
    }
}

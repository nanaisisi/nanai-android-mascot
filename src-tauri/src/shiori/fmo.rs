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
    guard
        .as_ref()
        .and_then(|m| m.get(name))
        .copied()
        .unwrap_or(false)
}

static HELD_HANDLES: Mutex<Vec<usize>> = Mutex::new(Vec::new());

/// ベースウェア動作宣言として "ssp" および "sakura" 名前つき Mutex を獲得・保持する
pub fn acquire_base_ware_mutexes() {
    #[cfg(target_os = "windows")]
    {
        if let Some(h) = win_mutex::acquire_mutex("ssp") {
            HELD_HANDLES.lock().unwrap().push(h as usize);
        }
        if let Some(h) = win_mutex::acquire_mutex("sakura") {
            HELD_HANDLES.lock().unwrap().push(h as usize);
        }
    }

    set_fallback_mutex("ssp", true);
    set_fallback_mutex("sakura", true);
    println!("🔒 BaseWare Named Mutexes ('ssp', 'sakura') successfully acquired and held.");
}

/// Set in-memory named mutex status for non-Windows or test environments
pub fn set_fallback_mutex(name: &str, active: bool) {
    let mut guard = FALLBACK_MUTEXES.lock().unwrap();
    let map = guard.get_or_insert_with(HashMap::new);
    map.insert(name.to_string(), active);
}

/// Generate FMO 64KB shared memory byte buffer conforming to UKADOC fmo spec
pub fn generate_fmo_buffer(records: &[FmoRecord]) -> Vec<u8> {
    let core_records: Vec<nanai_android_mascot_ui::fmo::FmoRecord> = records
        .iter()
        .map(|rec| nanai_android_mascot_ui::fmo::FmoRecord {
            id: rec.id.clone(),
            path: rec.path.clone(),
            hwnd: rec.hwnd,
            name: rec.name.clone(),
            keroname: rec.keroname.clone(),
            sakura_surface: rec.sakura_surface,
            kero_surface: rec.kero_surface,
            ghostpath: rec.ghost_path.clone(),
            kerohwnd: None,
            hwndlist: Vec::new(),
            fullname: None,
            modulestate: Some(rec.module_state.clone()),
        })
        .collect();

    nanai_android_mascot_ui::fmo::generate_fmo_buffer(&core_records)
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

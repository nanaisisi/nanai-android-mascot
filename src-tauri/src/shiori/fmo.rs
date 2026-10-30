//! FMO (File Mapping Object) & Mutex implementation (UKADOC / SSP fmo-mutex spec)
//! [FMO用Mutex], [FMO (File Mapping Object)], [Mutex]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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

/// Generate FMO 64KB shared memory byte buffer conforming to UKADOC fmo spec
pub fn generate_fmo_buffer(records: &[FmoRecord]) -> Vec<u8> {
    let mut content = String::new();
    for rec in records {
        let prefix = format!("ssp_fmo_header_{}", rec.id);
        content.push_str(&format!("{}.path\x01{}\r\n", prefix, rec.path));
        content.push_str(&format!("{}.hwnd\x01{}\r\n", prefix, rec.hwnd));
        content.push_str(&format!("{}.name\x01{}\r\n", prefix, rec.name));
        content.push_str(&format!("{}.keroname\x01{}\r\n", prefix, rec.keroname));
        content.push_str(&format!("{}.sakura.surface\x01{}\r\n", prefix, rec.sakura_surface));
        content.push_str(&format!("{}.kero.surface\x01{}\r\n", prefix, rec.kero_surface));
        content.push_str(&format!("{}.ghostpath\x01{}\r\n", prefix, rec.ghost_path));
        content.push_str(&format!("{}.modulestate\x01{}\r\n", prefix, rec.module_state));
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

#[tauri::command]
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
        base_ware_detected: "Nanai-Host".to_string(),
    })
}

#[tauri::command]
pub async fn check_base_ware_mutex() -> Result<HashMap<String, bool>, String> {
    let mut map = HashMap::new();
    map.insert("ssp".to_string(), false);
    map.insert("sakura".to_string(), false);
    map.insert("NanaiFMO".to_string(), true);
    Ok(map)
}

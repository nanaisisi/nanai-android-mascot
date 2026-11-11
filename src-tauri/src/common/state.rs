use crate::shiori::dynamic::ShioriDynamicEngine;
use parking_lot::Mutex;

pub struct AppState {
    pub recent_files: Mutex<Vec<String>>,
    pub current_ghost_name: Mutex<Option<String>>,
    pub num_characters: Mutex<i32>,
    pub shiori_engine: Mutex<Option<ShioriDynamicEngine>>,
    pub ghost_engines: Mutex<std::collections::HashMap<String, ShioriDynamicEngine>>,
    pub active_ghosts: Mutex<std::collections::HashMap<String, String>>,
    pub is_dialog_open: Mutex<bool>,
    pub balloon_offsets: Mutex<std::collections::HashMap<i32, (i32, i32)>>,
    pub surface_images: Mutex<std::collections::HashMap<i32, String>>,
    pub tray_icon: Mutex<Option<tauri::tray::TrayIcon<tauri::Wry>>>,
    pub is_minimized: Mutex<bool>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            recent_files: Mutex::new(Vec::new()),
            current_ghost_name: Mutex::new(None),
            num_characters: Mutex::new(3),
            shiori_engine: Mutex::new(None),
            ghost_engines: Mutex::new(std::collections::HashMap::new()),
            active_ghosts: Mutex::new(std::collections::HashMap::new()),
            is_dialog_open: Mutex::new(false),
            balloon_offsets: Mutex::new(std::collections::HashMap::new()),
            surface_images: Mutex::new(std::collections::HashMap::new()),
            tray_icon: Mutex::new(None),
            is_minimized: Mutex::new(false),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

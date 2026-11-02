use crate::shiori::dynamic::ShioriDynamicEngine;
use parking_lot::Mutex;

pub struct AppState {
    pub recent_files: Mutex<Vec<String>>,
    pub current_ghost_name: Mutex<Option<String>>,
    pub shiori_engine: Mutex<Option<ShioriDynamicEngine>>,
    pub ghost_engines: Mutex<std::collections::HashMap<String, ShioriDynamicEngine>>,
    pub active_ghosts: Mutex<std::collections::HashMap<String, String>>,
    pub is_dialog_open: Mutex<bool>,
    pub balloon_offsets: Mutex<std::collections::HashMap<i32, (i32, i32)>>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            recent_files: Mutex::new(Vec::new()),
            current_ghost_name: Mutex::new(None),
            shiori_engine: Mutex::new(None),
            ghost_engines: Mutex::new(std::collections::HashMap::new()),
            active_ghosts: Mutex::new(std::collections::HashMap::new()),
            is_dialog_open: Mutex::new(false),
            balloon_offsets: Mutex::new(std::collections::HashMap::new()),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

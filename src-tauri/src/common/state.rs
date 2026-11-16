use crate::shiori::dynamic::ShioriDynamicEngine;
use parking_lot::Mutex;

pub struct AppState {
    pub(crate) recent_files: Mutex<Vec<String>>,
    pub(crate) current_ghost_name: Mutex<Option<String>>,
    pub(crate) window_mode: Mutex<String>,
    pub(crate) num_characters: Mutex<i32>,
    pub(crate) shiori_engine: Mutex<Option<ShioriDynamicEngine>>,
    pub(crate) ghost_engines: Mutex<std::collections::HashMap<String, ShioriDynamicEngine>>,
    pub(crate) active_ghosts: Mutex<std::collections::HashMap<String, String>>,
    pub(crate) is_dialog_open: Mutex<bool>,
    pub(crate) balloon_offsets: Mutex<std::collections::HashMap<i32, (i32, i32)>>,
    pub(crate) surface_images: Mutex<std::collections::HashMap<i32, String>>,
    pub(crate) tray_icon: Mutex<Option<tauri::tray::TrayIcon<tauri::Wry>>>,
    pub(crate) is_minimized: Mutex<bool>,
}

#[allow(dead_code)]
impl AppState {
    pub fn new() -> Self {
        AppState {
            recent_files: Mutex::new(Vec::new()),
            current_ghost_name: Mutex::new(None),
            window_mode: Mutex::new("normal".to_string()),
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

    // Add getter methods
    pub fn recent_files(&self) -> &Mutex<Vec<String>> {
        &self.recent_files
    }
    pub fn current_ghost_name(&self) -> &Mutex<Option<String>> {
        &self.current_ghost_name
    }
    pub fn window_mode(&self) -> &Mutex<String> {
        &self.window_mode
    }
    pub fn num_characters(&self) -> &Mutex<i32> {
        &self.num_characters
    }
    pub fn shiori_engine(&self) -> &Mutex<Option<ShioriDynamicEngine>> {
        &self.shiori_engine
    }
    pub fn ghost_engines(&self) -> &Mutex<std::collections::HashMap<String, ShioriDynamicEngine>> {
        &self.ghost_engines
    }
    pub fn active_ghosts(&self) -> &Mutex<std::collections::HashMap<String, String>> {
        &self.active_ghosts
    }
    pub fn is_dialog_open(&self) -> &Mutex<bool> {
        &self.is_dialog_open
    }
    pub fn balloon_offsets(&self) -> &Mutex<std::collections::HashMap<i32, (i32, i32)>> {
        &self.balloon_offsets
    }
    pub fn surface_images(&self) -> &Mutex<std::collections::HashMap<i32, String>> {
        &self.surface_images
    }
    pub fn tray_icon(&self) -> &Mutex<Option<tauri::tray::TrayIcon<tauri::Wry>>> {
        &self.tray_icon
    }
    pub fn is_minimized(&self) -> &Mutex<bool> {
        &self.is_minimized
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

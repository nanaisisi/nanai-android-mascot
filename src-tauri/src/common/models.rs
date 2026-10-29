use crate::shiori::dynamic::ShioriDynamicEngine;
use parking_lot::Mutex;

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct ShellMenuTheme {
    pub background_color: Option<String>,
    pub foreground_color: Option<String>,
    pub font_color: Option<String>,
    pub background_font_color: Option<String>,
    pub foreground_font_color: Option<String>,
    pub disable_font_color: Option<String>,
    pub separator_color: Option<String>,
    pub background_bitmap: Option<String>,
    pub foreground_bitmap: Option<String>,
    pub sidebar_bitmap: Option<String>,
    pub background_alignment: Option<String>,
    pub foreground_alignment: Option<String>,
    pub sidebar_alignment: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ShellInfo {
    pub name: String,
    pub path: String,
    pub display_name: Option<String>,
    pub menu_theme: Option<ShellMenuTheme>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct GhostInfo {
    pub name: String,
    pub version: Option<String>,
    pub path: String,
    pub sakura_name: Option<String>,
    pub kero_name: Option<String>,
    pub shiori: Option<String>,
    pub craftman: Option<String>,
    pub craftman_url: Option<String>,
    pub shells: Vec<ShellInfo>,
    pub group: Option<String>,
    pub install_date: Option<String>,
    pub update_date: Option<String>,
    pub update_result: Option<String>,
    /// [balloon,バルーン名], [recommended.balloon,バルーン名]:
    pub recommended_balloon: Option<String>,
    /// [標準と推奨の使い分け], [recommended.balloon.path,パス]:
    pub recommended_balloon_path: Option<String>,
    /// [default.balloon.path,パス]:
    pub default_balloon_path: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PluginInfo {
    pub name: String,
    pub version: Option<String>,
    pub path: String,
    pub craftman: Option<String>,
    pub craftman_url: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct HeadlineInfo {
    pub name: String,
    pub version: Option<String>,
    pub path: String,
    pub craftman: Option<String>,
    pub craftman_url: Option<String>,
    pub url: Option<String>,
}

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

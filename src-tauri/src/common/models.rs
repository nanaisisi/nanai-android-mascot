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

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
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
    pub shiori_version: Option<String>,
    pub shiori_cache: Option<String>,
    pub shiori_encoding: Option<String>,
    pub shiori_forceencoding: Option<String>,
    pub shiori_escape_unknown: Option<String>,
    pub shiori_logo_file: Option<String>,
    pub shiori_logo_align: Option<String>,
    pub shiori_logo_x: Option<i32>,
    pub shiori_logo_y: Option<i32>,
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

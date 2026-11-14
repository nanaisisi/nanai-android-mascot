#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct ShellMenuTheme {
    pub(crate) background_color: Option<String>,
    pub(crate) foreground_color: Option<String>,
    pub(crate) font_color: Option<String>,
    pub(crate) background_font_color: Option<String>,
    pub(crate) foreground_font_color: Option<String>,
    pub(crate) disable_font_color: Option<String>,
    pub(crate) separator_color: Option<String>,
    pub(crate) background_bitmap: Option<String>,
    pub(crate) foreground_bitmap: Option<String>,
    pub(crate) sidebar_bitmap: Option<String>,
    pub(crate) background_alignment: Option<String>,
    pub(crate) foreground_alignment: Option<String>,
    pub(crate) sidebar_alignment: Option<String>,
    pub(crate) frame_color: Option<String>,
    pub(crate) font_name: Option<String>,
    pub(crate) font_height: Option<String>,
}

#[allow(dead_code)]
impl ShellMenuTheme {
    // Add getter methods
    pub fn background_color(&self) -> Option<&str> {
        self.background_color.as_deref()
    }
    pub fn foreground_color(&self) -> Option<&str> {
        self.foreground_color.as_deref()
    }
    pub fn font_color(&self) -> Option<&str> {
        self.font_color.as_deref()
    }
    pub fn background_font_color(&self) -> Option<&str> {
        self.background_font_color.as_deref()
    }
    pub fn foreground_font_color(&self) -> Option<&str> {
        self.foreground_font_color.as_deref()
    }
    pub fn disable_font_color(&self) -> Option<&str> {
        self.disable_font_color.as_deref()
    }
    pub fn separator_color(&self) -> Option<&str> {
        self.separator_color.as_deref()
    }
    pub fn background_bitmap(&self) -> Option<&str> {
        self.background_bitmap.as_deref()
    }
    pub fn foreground_bitmap(&self) -> Option<&str> {
        self.foreground_bitmap.as_deref()
    }
    pub fn sidebar_bitmap(&self) -> Option<&str> {
        self.sidebar_bitmap.as_deref()
    }
    pub fn background_alignment(&self) -> Option<&str> {
        self.background_alignment.as_deref()
    }
    pub fn foreground_alignment(&self) -> Option<&str> {
        self.foreground_alignment.as_deref()
    }
    pub fn sidebar_alignment(&self) -> Option<&str> {
        self.sidebar_alignment.as_deref()
    }
    pub fn frame_color(&self) -> Option<&str> {
        self.frame_color.as_deref()
    }
    pub fn font_name(&self) -> Option<&str> {
        self.font_name.as_deref()
    }
    pub fn font_height(&self) -> Option<&str> {
        self.font_height.as_deref()
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ShellInfo {
    pub(crate) name: String,
    pub(crate) path: String,
    pub(crate) display_name: Option<String>,
    pub(crate) menu_theme: Option<ShellMenuTheme>,
}

#[allow(dead_code)]
impl ShellInfo {
    // Add getter methods
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn path(&self) -> &str {
        &self.path
    }
    pub fn display_name(&self) -> Option<&str> {
        self.display_name.as_deref()
    }
    pub fn menu_theme(&self) -> Option<&ShellMenuTheme> {
        self.menu_theme.as_ref()
    }
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct GhostInfo {
    pub(crate) name: String,
    pub(crate) version: Option<String>,
    pub(crate) path: String,
    pub(crate) sakura_name: Option<String>,
    pub(crate) kero_name: Option<String>,
    pub(crate) num_characters: i32,
    pub(crate) shiori: Option<String>,
    pub(crate) makoto: Option<String>,
    pub(crate) craftman: Option<String>,
    pub(crate) craftman_url: Option<String>,
    pub(crate) shells: Vec<ShellInfo>,
    pub(crate) group: Option<String>,
    pub(crate) install_date: Option<String>,
    pub(crate) update_date: Option<String>,
    pub(crate) update_result: Option<String>,
    pub(crate) recommended_balloon: Option<String>,
    pub(crate) recommended_balloon_path: Option<String>,
    pub(crate) default_balloon_path: Option<String>,
    pub(crate) balloon_defaultsurface: Option<i32>,
    pub(crate) sakura_balloon_defaultsurface: Option<i32>,
    pub(crate) kero_balloon_defaultsurface: Option<i32>,
    pub(crate) char_balloon_defaultsurfaces: std::collections::BTreeMap<i32, i32>,
    pub(crate) shiori_version: Option<String>,
    pub(crate) shiori_cache: Option<String>,
    pub(crate) shiori_encoding: Option<String>,
    pub(crate) shiori_forceencoding: Option<String>,
    pub(crate) shiori_escape_unknown: Option<String>,
    pub(crate) shiori_logo_file: Option<String>,
    pub(crate) shiori_logo_align: Option<String>,
    pub(crate) shiori_logo_x: Option<i32>,
    pub(crate) shiori_logo_y: Option<i32>,
}

#[allow(dead_code)]
impl GhostInfo {
    // Add getter methods
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn version(&self) -> Option<&str> {
        self.version.as_deref()
    }
    pub fn path(&self) -> &str {
        &self.path
    }
    pub fn sakura_name(&self) -> Option<&str> {
        self.sakura_name.as_deref()
    }
    pub fn kero_name(&self) -> Option<&str> {
        self.kero_name.as_deref()
    }
    pub fn num_characters(&self) -> i32 {
        self.num_characters
    }
    pub fn shiori(&self) -> Option<&str> {
        self.shiori.as_deref()
    }
    pub fn makoto(&self) -> Option<&str> {
        self.makoto.as_deref()
    }
    pub fn craftman(&self) -> Option<&str> {
        self.craftman.as_deref()
    }
    pub fn craftman_url(&self) -> Option<&str> {
        self.craftman_url.as_deref()
    }
    pub fn shells(&self) -> &[ShellInfo] {
        &self.shells
    }
    pub fn group(&self) -> Option<&str> {
        self.group.as_deref()
    }
    pub fn install_date(&self) -> Option<&str> {
        self.install_date.as_deref()
    }
    pub fn update_date(&self) -> Option<&str> {
        self.update_date.as_deref()
    }
    pub fn update_result(&self) -> Option<&str> {
        self.update_result.as_deref()
    }
    pub fn recommended_balloon(&self) -> Option<&str> {
        self.recommended_balloon.as_deref()
    }
    pub fn recommended_balloon_path(&self) -> Option<&str> {
        self.recommended_balloon_path.as_deref()
    }
    pub fn default_balloon_path(&self) -> Option<&str> {
        self.default_balloon_path.as_deref()
    }
    pub fn balloon_defaultsurface(&self) -> Option<i32> {
        self.balloon_defaultsurface
    }
    pub fn sakura_balloon_defaultsurface(&self) -> Option<i32> {
        self.sakura_balloon_defaultsurface
    }
    pub fn kero_balloon_defaultsurface(&self) -> Option<i32> {
        self.kero_balloon_defaultsurface
    }
    pub fn char_balloon_defaultsurfaces(&self) -> &std::collections::BTreeMap<i32, i32> {
        &self.char_balloon_defaultsurfaces
    }
    pub fn shiori_version(&self) -> Option<&str> {
        self.shiori_version.as_deref()
    }
    pub fn shiori_cache(&self) -> Option<&str> {
        self.shiori_cache.as_deref()
    }
    pub fn shiori_encoding(&self) -> Option<&str> {
        self.shiori_encoding.as_deref()
    }
    pub fn shiori_forceencoding(&self) -> Option<&str> {
        self.shiori_forceencoding.as_deref()
    }
    pub fn shiori_escape_unknown(&self) -> Option<&str> {
        self.shiori_escape_unknown.as_deref()
    }
    pub fn shiori_logo_file(&self) -> Option<&str> {
        self.shiori_logo_file.as_deref()
    }
    pub fn shiori_logo_align(&self) -> Option<&str> {
        self.shiori_logo_align.as_deref()
    }
    pub fn shiori_logo_x(&self) -> Option<i32> {
        self.shiori_logo_x
    }
    pub fn shiori_logo_y(&self) -> Option<i32> {
        self.shiori_logo_y
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PluginInfo {
    pub(crate) name: String,
    pub(crate) version: Option<String>,
    pub(crate) path: String,
    pub(crate) craftman: Option<String>,
    pub(crate) craftman_url: Option<String>,
    pub(crate) description: Option<String>,
}

#[allow(dead_code)]
impl PluginInfo {
    // Add getter methods
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn version(&self) -> Option<&str> {
        self.version.as_deref()
    }
    pub fn path(&self) -> &str {
        &self.path
    }
    pub fn craftman(&self) -> Option<&str> {
        self.craftman.as_deref()
    }
    pub fn craftman_url(&self) -> Option<&str> {
        self.craftman_url.as_deref()
    }
    pub fn description(&self) -> Option<&str> {
        self.description.as_deref()
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct HeadlineInfo {
    pub(crate) name: String,
    pub(crate) version: Option<String>,
    pub(crate) path: String,
    pub(crate) craftman: Option<String>,
    pub(crate) craftman_url: Option<String>,
    pub(crate) url: Option<String>,
}

#[allow(dead_code)]
impl HeadlineInfo {
    // Add getter methods
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn version(&self) -> Option<&str> {
        self.version.as_deref()
    }
    pub fn path(&self) -> &str {
        &self.path
    }
    pub fn craftman(&self) -> Option<&str> {
        self.craftman.as_deref()
    }
    pub fn craftman_url(&self) -> Option<&str> {
        self.craftman_url.as_deref()
    }
    pub fn url(&self) -> Option<&str> {
        self.url.as_deref()
    }
}

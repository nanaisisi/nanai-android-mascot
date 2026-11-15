//! シェルおよびメニューテーマデータモデル

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

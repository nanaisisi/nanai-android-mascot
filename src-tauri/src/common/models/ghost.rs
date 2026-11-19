//! ゴースト属性・マニフェストデータモデル

use super::shell::ShellInfo;
use std::collections::BTreeMap;

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct GhostInfo {
    #[serde(default)]
    pub(crate) assets: crate::ghost::scan::assets::GhostAssets,
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
    pub(crate) char_balloon_defaultsurfaces: BTreeMap<i32, i32>,
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
    pub fn char_balloon_defaultsurfaces(&self) -> &BTreeMap<i32, i32> {
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

//! ゴーストマニフェストモデル定義

use std::collections::BTreeMap;

#[allow(dead_code)]
pub struct GhostManifest {
    pub(crate) display_name: String,
    pub(crate) version: Option<String>,
    pub(crate) sakura_name: Option<String>,
    pub(crate) kero_name: Option<String>,
    pub(crate) num_characters: i32,
    pub(crate) shiori: Option<String>,
    pub(crate) makoto: Option<String>,
    pub(crate) craftman: Option<String>,
    pub(crate) craftman_url: Option<String>,
    pub(crate) group: Option<String>,
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
    pub(crate) sstp_allow_communicate: bool,
    pub(crate) sstp_allow_unspecified_send: bool,
    pub(crate) sstp_always_translate: bool,
    pub(crate) install_accept: Option<String>,
    pub(crate) dont_need_onmousemove: bool,
    pub(crate) dont_need_bind: bool,
    pub(crate) dont_need_seriko_talk: bool,
    pub(crate) name_allowoverride: bool,
}

#[allow(dead_code)]
impl GhostManifest {
    pub fn display_name(&self) -> &str {
        &self.display_name
    }
    pub fn version(&self) -> Option<&str> {
        self.version.as_deref()
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
    pub fn group(&self) -> Option<&str> {
        self.group.as_deref()
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
    pub fn sstp_allow_communicate(&self) -> bool {
        self.sstp_allow_communicate
    }
    pub fn sstp_allow_unspecified_send(&self) -> bool {
        self.sstp_allow_unspecified_send
    }
    pub fn sstp_always_translate(&self) -> bool {
        self.sstp_always_translate
    }
    pub fn install_accept(&self) -> Option<&str> {
        self.install_accept.as_deref()
    }
    pub fn dont_need_onmousemove(&self) -> bool {
        self.dont_need_onmousemove
    }
    pub fn dont_need_bind(&self) -> bool {
        self.dont_need_bind
    }
    pub fn dont_need_seriko_talk(&self) -> bool {
        self.dont_need_seriko_talk
    }
    pub fn name_allowoverride(&self) -> bool {
        self.name_allowoverride
    }
}

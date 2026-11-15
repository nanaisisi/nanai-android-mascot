//! プラグインおよびヘッドラインデータモデル

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

//! FMO (File Mapping Object) 構造体・モデル定義

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FmoGhostStatus {
    pub(crate) name: String,
    #[serde(default)]
    pub(crate) keroname: String,
    pub(crate) surface0: u32,
    pub(crate) surface1: u32,
    pub(crate) balloon0: String,
    pub(crate) balloon1: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) kerohwnd: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) modulestate: Option<String>,
    pub(crate) path: String,
    #[serde(default = "default_true")]
    pub(crate) is_visible: bool,
    #[serde(default = "default_active")]
    pub(crate) lifecycle_state: String,
}

#[allow(dead_code)]
impl FmoGhostStatus {
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn keroname(&self) -> &str {
        &self.keroname
    }
    pub fn surface0(&self) -> u32 {
        self.surface0
    }
    pub fn surface1(&self) -> u32 {
        self.surface1
    }
    pub fn balloon0(&self) -> &str {
        &self.balloon0
    }
    pub fn balloon1(&self) -> &str {
        &self.balloon1
    }
    pub fn kerohwnd(&self) -> Option<u64> {
        self.kerohwnd
    }
    pub fn modulestate(&self) -> Option<&str> {
        self.modulestate.as_deref()
    }
    pub fn path(&self) -> &str {
        &self.path
    }
    pub fn is_visible(&self) -> bool {
        self.is_visible
    }
    pub fn lifecycle_state(&self) -> &str {
        &self.lifecycle_state
    }
}

pub(crate) fn default_true() -> bool {
    true
}

pub(crate) fn default_active() -> String {
    "active".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FmoSystemStatus {
    pub(crate) ghosts: HashMap<String, FmoGhostStatus>,
    pub(crate) hwnd: u64,
    pub(crate) craftman: String,
}

#[allow(dead_code)]
impl FmoSystemStatus {
    pub fn ghosts(&self) -> &HashMap<String, FmoGhostStatus> {
        &self.ghosts
    }
    pub fn hwnd(&self) -> u64 {
        self.hwnd
    }
    pub fn craftman(&self) -> &str {
        &self.craftman
    }
}

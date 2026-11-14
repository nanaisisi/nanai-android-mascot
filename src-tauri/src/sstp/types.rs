//! (SakuraScript Transfer Protocol) types module

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SstpRequest {
    pub(crate) method: Option<String>,
    pub(crate) sender: String,
    pub(crate) script: Option<String>,
    pub(crate) event: Option<String>,
    pub(crate) hwnd: Option<u64>,
    pub(crate) security_level: Option<String>,
    pub(crate) security_origin: Option<String>,
    pub(crate) id: Option<String>,
    pub(crate) options: Vec<String>,
    pub(crate) references: HashMap<String, String>,
    pub(crate) connection: Option<String>,
    pub(crate) keep_alive: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) surface: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) document: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) song: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) command: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) module: Option<String>,
    #[serde(default)]
    pub(crate) is_direct: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) sentence: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) receiver_ghost_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) receiver_ghost_hwnd: Option<u64>,
}

#[allow(dead_code)]
impl SstpRequest {
    // Add getter methods
    pub fn method(&self) -> Option<&str> {
        self.method.as_deref()
    }
    pub fn sender(&self) -> &str {
        &self.sender
    }
    pub fn script(&self) -> Option<&str> {
        self.script.as_deref()
    }
    pub fn event(&self) -> Option<&str> {
        self.event.as_deref()
    }
    pub fn hwnd(&self) -> Option<u64> {
        self.hwnd
    }
    pub fn security_level(&self) -> Option<&str> {
        self.security_level.as_deref()
    }
    pub fn security_origin(&self) -> Option<&str> {
        self.security_origin.as_deref()
    }
    pub fn id(&self) -> Option<&str> {
        self.id.as_deref()
    }
    pub fn options(&self) -> &[String] {
        &self.options
    }
    pub fn references(&self) -> &HashMap<String, String> {
        &self.references
    }
    pub fn connection(&self) -> Option<&str> {
        self.connection.as_deref()
    }
    pub fn keep_alive(&self) -> Option<bool> {
        self.keep_alive
    }
    pub fn surface(&self) -> Option<&str> {
        self.surface.as_deref()
    }
    pub fn document(&self) -> Option<&str> {
        self.document.as_deref()
    }
    pub fn song(&self) -> Option<&str> {
        self.song.as_deref()
    }
    pub fn command(&self) -> Option<&str> {
        self.command.as_deref()
    }
    pub fn module(&self) -> Option<&str> {
        self.module.as_deref()
    }
    pub fn is_direct(&self) -> bool {
        self.is_direct
    }
    pub fn sentence(&self) -> Option<&str> {
        self.sentence.as_deref()
    }
    pub fn receiver_ghost_name(&self) -> Option<&str> {
        self.receiver_ghost_name.as_deref()
    }
    pub fn receiver_ghost_hwnd(&self) -> Option<u64> {
        self.receiver_ghost_hwnd
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpResponse {
    pub(crate) status: String,
    pub(crate) value: String,
    pub(crate) id: Option<String>,
    pub(crate) reference0: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) additional_data: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) error_description: Option<String>,
}

#[allow(dead_code)]
impl SstpResponse {
    // Add getter methods
    pub fn status(&self) -> &str {
        &self.status
    }
    pub fn value(&self) -> &str {
        &self.value
    }
    pub fn id(&self) -> Option<&str> {
        self.id.as_deref()
    }
    pub fn reference0(&self) -> Option<&str> {
        self.reference0.as_deref()
    }
    pub fn additional_data(&self) -> Option<&str> {
        self.additional_data.as_deref()
    }
    pub fn error_description(&self) -> Option<&str> {
        self.error_description.as_deref()
    }
}

/// SSTP ブレイク発生時の通知ペイロード (UKADOC OnSSTPBreak 規格準拠)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpBreakEvent {
    pub(crate) script: String,
    pub(crate) scope: u32,
    pub(crate) break_position: usize,
}

#[allow(dead_code)]
impl SstpBreakEvent {
    // Add getter methods
    pub fn script(&self) -> &str {
        &self.script
    }
    pub fn scope(&self) -> u32 {
        self.scope
    }
    pub fn break_position(&self) -> usize {
        self.break_position
    }
}

/// SSTP ブラックリスト登録発生時の通知ペイロード (UKADOC OnSSTPBlacklisting 規格準拠)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpBlacklistingEvent {
    pub(crate) client_ip: String,
}

#[allow(dead_code)]
impl SstpBlacklistingEvent {
    // Add getter methods
    pub fn client_ip(&self) -> &str {
        &self.client_ip
    }
}

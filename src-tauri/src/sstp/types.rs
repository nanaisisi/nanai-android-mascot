//! SSTP (SakuraScript Transfer Protocol) types module

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SstpRequest {
    pub method: Option<String>,
    pub sender: String,
    pub script: Option<String>,
    pub event: Option<String>,
    pub hwnd: Option<u64>,
    pub security_level: Option<String>,
    pub security_origin: Option<String>,
    pub id: Option<String>,
    pub options: Vec<String>,
    pub references: HashMap<String, String>,
    pub keep_alive: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub surface: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub document: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub song: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub command: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub module: Option<String>,
    #[serde(default)]
    pub is_direct: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sentence: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub receiver_ghost_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub receiver_ghost_hwnd: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpResponse {
    pub status: String,
    pub value: String,
    pub id: Option<String>,
    pub reference0: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub additional_data: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error_description: Option<String>,
}

/// SSTP ブレイク発生時の通知ペイロード (UKADOC OnSSTPBreak 規格準拠)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpBreakEvent {
    pub script: String,
    pub scope: u32,
    pub break_position: usize,
}

/// SSTP ブラックリスト登録発生時の通知ペイロード (UKADOC OnSSTPBlacklisting 規格準拠)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpBlacklistingEvent {
    pub client_ip: String,
}

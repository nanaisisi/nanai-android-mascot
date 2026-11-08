//! SSTP レスポンス構造体および関連処理モジュール

pub mod build;
pub mod parse;

use crate::sstp::types::SstpStatusCode;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// SSTP レスポンス構造体
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SstpResponse {
    pub version: String,
    pub status: SstpStatusCode,
    pub charset: String,
    pub script: Option<String>,
    pub references: HashMap<String, String>,
    pub pass_thru: HashMap<String, String>,
    pub additional_data: Option<String>,
    /// SAORI / エラー応答ヘッダ (ErrorDescription)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error_description: Option<String>,
    /// Keep-Alive 接続維持フラグ (UKADOC keepalive.md 規格準拠)
    #[serde(default)]
    pub keep_alive: bool,
    /// Keep-Alive タイムアウト秒数 (既定: 5秒)
    #[serde(default = "default_keep_alive_timeout")]
    pub keep_alive_timeout: u32,
    /// 明示的な Connection ヘッダ出力指示 (例: Connection: close)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub connection_header: Option<String>,
    /// HTTP トンネリング互換 Content-Type ヘッダ (例: "text/plain")
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub content_type: Option<String>,
}

fn default_keep_alive_timeout() -> u32 {
    5
}

impl SstpResponse {
    pub fn new(status: SstpStatusCode) -> Self {
        Self {
            version: "SSTP/1.4".to_string(),
            status,
            charset: "UTF-8".to_string(),
            script: None,
            references: HashMap::new(),
            pass_thru: HashMap::new(),
            additional_data: None,
            error_description: None,
            keep_alive: false,
            keep_alive_timeout: 5,
            connection_header: None,
            content_type: None,
        }
    }

    pub fn ok(script: Option<String>) -> Self {
        let mut res = Self::new(SstpStatusCode::Ok);
        res.script = script;
        res
    }

    pub fn no_content() -> Self {
        Self::new(SstpStatusCode::NoContent)
    }

    pub fn bad_request() -> Self {
        Self::new(SstpStatusCode::BadRequest)
    }

    pub fn not_found() -> Self {
        Self::new(SstpStatusCode::NotFound)
    }

    pub fn conflict() -> Self {
        Self::new(SstpStatusCode::Conflict)
    }

    pub fn refuse() -> Self {
        Self::new(SstpStatusCode::Refuse)
    }

    pub fn payload_too_large() -> Self {
        Self::new(SstpStatusCode::PayloadTooLarge)
    }

    pub fn internal_server_error() -> Self {
        Self::new(SstpStatusCode::InternalServerError)
    }

    pub fn invisible() -> Self {
        Self::new(SstpStatusCode::Invisible)
    }

    pub fn service_unavailable() -> Self {
        Self::new(SstpStatusCode::ServiceUnavailable)
    }

    pub fn version_not_supported() -> Self {
        Self::new(SstpStatusCode::VersionNotSupported)
    }

    /// EXECUTE コマンド用のレスポンス構築（追加データ付き）
    pub fn with_additional_data(mut self, data: impl Into<String>) -> Self {
        self.additional_data = Some(data.into());
        self
    }

    /// ErrorDescription ヘッダを設定
    pub fn with_error_description(mut self, desc: impl Into<String>) -> Self {
        self.error_description = Some(desc.into());
        self
    }

    /// Keep-Alive 接続維持を設定
    pub fn with_keep_alive(mut self, keep_alive: bool) -> Self {
        self.keep_alive = keep_alive;
        if keep_alive {
            self.connection_header = Some("keep-alive".to_string());
        } else {
            self.connection_header = Some("close".to_string());
        }
        self
    }

    /// Keep-Alive タイムアウト秒数を設定
    pub fn with_keep_alive_timeout(mut self, timeout: u32) -> Self {
        self.keep_alive_timeout = timeout;
        self
    }

    /// Content-Type ヘッダを設定
    pub fn with_content_type(mut self, content_type: impl Into<String>) -> Self {
        self.content_type = Some(content_type.into());
        self
    }

    /// 明示的な Connection ヘッダを設定
    pub fn with_connection(mut self, connection: impl Into<String>) -> Self {
        self.connection_header = Some(connection.into());
        self
    }
}

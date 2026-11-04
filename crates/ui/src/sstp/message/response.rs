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

    /// SSTP レスポンス文字列を構築する (UKADOC req_res / keepalive 準拠)
    pub fn build(&self) -> String {
        let mut out = format!(
            "{} {} {}\r\n",
            self.version,
            self.status.code(),
            self.status.reason_phrase()
        );
        out.push_str(&format!("Charset: {}\r\n", self.charset));

        if let Some(ref conn) = self.connection_header {
            out.push_str(&format!("Connection: {}\r\n", conn));
            if conn.eq_ignore_ascii_case("keep-alive") {
                out.push_str(&format!(
                    "Keep-Alive: timeout={}\r\n",
                    self.keep_alive_timeout
                ));
            }
        }

        if let Some(ref script) = self.script {
            // スクリプト内の改行は除去する（仕様準拠）
            let flat_script = script.replace(['\r', '\n'], "");
            out.push_str(&format!("Script: {}\r\n", flat_script));
        }

        if let Some(ref err) = self.error_description {
            out.push_str(&format!("ErrorDescription: {}\r\n", err));
        }

        // References
        let mut ref_keys: Vec<_> = self.references.keys().collect();
        ref_keys.sort();
        for k in ref_keys {
            out.push_str(&format!("{}: {}\r\n", k, self.references[k]));
        }

        // PassThru
        let mut pt_keys: Vec<_> = self.pass_thru.keys().collect();
        pt_keys.sort();
        for k in pt_keys {
            out.push_str(&format!("{}: {}\r\n", k, self.pass_thru[k]));
        }

        // Keep-Alive 時の Content-Length ヘッダ (UKADOC keepalive.md 規格準拠)
        if self.keep_alive
            && self.connection_header.as_deref() == Some("keep-alive")
            && let Some(ref data) = self.additional_data
        {
            out.push_str(&format!("Content-Length: {}\r\n", data.len()));
            out.push_str("\r\n");
            out.push_str(data);
            // keepalive 時は追加データ後ろに空行を付けない
            return out;
        }

        out.push_str("\r\n");

        if let Some(ref data) = self.additional_data {
            out.push_str(data);
            if !data.ends_with("\r\n") {
                out.push_str("\r\n");
            }
            out.push_str("\r\n");
        }

        out
    }
}

//! SSTP (Sakura Script Transfer Protocol) 実装（ukadoc-spec / sstp 準拠）
//!
//! SSTP/1.1, SSTP/1.2, SSTP/1.3, SSTP/1.4, DirectSSTP のリクエスト・レスポンス解析および構築を行う。

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// SSTP メソッド
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SstpMethod {
    Send,
    Notify,
    Execute,
    Communicate,
    Give,
}

impl SstpMethod {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Send => "SEND",
            Self::Notify => "NOTIFY",
            Self::Execute => "EXECUTE",
            Self::Communicate => "COMMUNICATE",
            Self::Give => "GIVE",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        let upper = s.trim().to_uppercase();
        if upper == "SEND" {
            Some(Self::Send)
        } else if upper == "NOTIFY" {
            Some(Self::Notify)
        } else if upper == "EXECUTE" {
            Some(Self::Execute)
        } else if upper == "COMMUNICATE" {
            Some(Self::Communicate)
        } else if upper == "GIVE" {
            Some(Self::Give)
        } else {
            None
        }
    }
}

/// SSTP レスポンスステータスコード
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SstpStatusCode {
    Ok = 200,
    NoContent = 204,
    Break = 210,
    BadRequest = 400,
    NotFound = 404,
    RequestTimeout = 408,
    Conflict = 409,
    PayloadTooLarge = 413,
    Refuse = 420,
    InternalServerError = 500,
    NotImplemented = 501,
    ServiceUnavailable = 503,
    VersionNotSupported = 505,
    Invisible = 512,
}

impl SstpStatusCode {
    pub fn code(&self) -> u16 {
        *self as u16
    }

    pub fn reason_phrase(&self) -> &'static str {
        match self {
            Self::Ok => "OK",
            Self::NoContent => "No Content",
            Self::Break => "Break",
            Self::BadRequest => "Bad Request",
            Self::NotFound => "Not Found",
            Self::RequestTimeout => "Request Timeout",
            Self::Conflict => "Conflict",
            Self::PayloadTooLarge => "Payload Too Large",
            Self::Refuse => "Refuse",
            Self::InternalServerError => "Internal Server Error",
            Self::NotImplemented => "Not Implemented",
            Self::ServiceUnavailable => "Service Unavailable",
            Self::VersionNotSupported => "Version Not Supported",
            Self::Invisible => "Invisible",
        }
    }
}

/// IfGhost によるスクリプト振り分けエントリ
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct IfGhostEntry {
    pub target: String,
    pub script: String,
}

/// SSTP リクエスト構造体
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SstpRequest {
    pub method: SstpMethod,
    pub version: String,
    pub charset: Option<String>,
    pub sender: String,
    pub script: Option<String>,
    pub event: Option<String>,
    pub sentence: Option<String>,
    pub command: Option<String>,
    pub hwnd: Option<u64>,
    pub receiver_ghost_hwnd: Option<u64>,
    pub receiver_ghost_name: Option<String>,
    pub security_level: Option<String>,
    pub security_origin: Option<String>,
    pub options: Vec<String>,
    pub entry: Option<String>,
    pub if_ghosts: Vec<IfGhostEntry>,
    pub references: HashMap<String, String>,
    pub pass_thru: HashMap<String, String>,
    pub keep_alive: bool,
}

impl SstpRequest {
    /// 生テキストから SSTP リクエストをパースする
    pub fn parse(raw: &str) -> Result<Self, String> {
        let mut lines = raw.lines();
        let first_line = lines.next().ok_or("Empty SSTP request")?.trim();
        if first_line.is_empty() {
            return Err("Empty SSTP request header line".to_string());
        }

        let parts: Vec<&str> = first_line.split_whitespace().collect();
        if parts.len() < 2 {
            return Err(format!("Invalid SSTP request line: {}", first_line));
        }

        let method = SstpMethod::parse(parts[0])
            .ok_or_else(|| format!("Unsupported SSTP method: {}", parts[0]))?;
        let version = parts[1].to_string();

        let mut charset = None;
        let mut sender = String::new();
        let mut default_script = None;
        let mut event = None;
        let mut sentence = None;
        let mut command = None;
        let mut hwnd = None;
        let mut receiver_ghost_hwnd = None;
        let mut receiver_ghost_name = None;
        let mut security_level = None;
        let mut security_origin = None;
        let mut options = Vec::new();
        let mut entry = None;
        let mut if_ghosts = Vec::new();
        let mut current_if_ghost: Option<String> = None;
        let mut references = HashMap::new();
        let mut pass_thru = HashMap::new();
        let mut keep_alive = false;

        for line in lines {
            let line = line.trim();
            if line.is_empty() {
                break;
            }
            if let Some((k, v)) = line.split_once(':') {
                let key = k.trim();
                let val = v.trim().to_string();
                let key_lower = key.to_lowercase();

                if key_lower == "charset" {
                    charset = Some(val);
                } else if key_lower == "sender" {
                    sender = val;
                } else if key_lower == "script" {
                    if let Some(target) = current_if_ghost.take() {
                        if_ghosts.push(IfGhostEntry {
                            target,
                            script: val,
                        });
                    } else if default_script.is_none() {
                        default_script = Some(val);
                    }
                } else if key_lower == "ifghost" {
                    current_if_ghost = Some(val);
                } else if key_lower == "event" {
                    event = Some(val);
                } else if key_lower == "sentence" {
                    sentence = Some(val);
                } else if key_lower == "command" {
                    command = Some(val);
                } else if key_lower == "hwnd" {
                    hwnd = val.parse().ok();
                } else if key_lower == "receiverghosthwnd" {
                    receiver_ghost_hwnd = val.parse().ok();
                } else if key_lower == "receiverghostname" {
                    receiver_ghost_name = Some(val);
                } else if key_lower == "securitylevel" {
                    security_level = Some(val);
                } else if key_lower == "securityorigin" {
                    security_origin = Some(val);
                } else if key_lower == "option" {
                    for opt in val.split(',') {
                        let opt_trim = opt.trim();
                        if !opt_trim.is_empty() {
                            options.push(opt_trim.to_string());
                        }
                    }
                } else if key_lower == "entry" {
                    entry = Some(val);
                } else if key_lower == "keepalive" {
                    keep_alive = val.to_lowercase() == "true" || val == "1";
                } else if key_lower.starts_with("reference") {
                    references.insert(key.to_string(), val);
                } else if key_lower.starts_with("x-sstp-passthru-") {
                    pass_thru.insert(key.to_string(), val);
                }
            }
        }

        if sender.is_empty() {
            sender = "Unknown".to_string();
        }

        Ok(Self {
            method,
            version,
            charset,
            sender,
            script: default_script,
            event,
            sentence,
            command,
            hwnd,
            receiver_ghost_hwnd,
            receiver_ghost_name,
            security_level,
            security_origin,
            options,
            entry,
            if_ghosts,
            references,
            pass_thru,
            keep_alive,
        })
    }

    /// 対象のゴースト名（sakura名, kero名）に応じたスクリプトを解決する
    pub fn resolve_script(&self, sakura_name: &str, kero_name: &str) -> Option<&str> {
        for entry in &self.if_ghosts {
            if let Some((target_sakura, target_kero)) = entry.target.split_once(',') {
                if target_sakura.trim().eq_ignore_ascii_case(sakura_name)
                    && target_kero.trim().eq_ignore_ascii_case(kero_name)
                {
                    return Some(&entry.script);
                }
            } else if entry.target.trim().eq_ignore_ascii_case(sakura_name) {
                return Some(&entry.script);
            }
        }
        self.script.as_deref()
    }
}

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

    /// SSTP レスポンス文字列を構築する
    pub fn build(&self) -> String {
        let mut out = format!(
            "{} {} {}\r\n",
            self.version,
            self.status.code(),
            self.status.reason_phrase()
        );
        out.push_str(&format!("Charset: {}\r\n", self.charset));
        if let Some(ref script) = self.script {
            // スクリプト内の改行は除去する（仕様準拠）
            let flat_script = script.replace(['\r', '\n'], "");
            out.push_str(&format!("Script: {}\r\n", flat_script));
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

#[cfg(test)]
mod tests;

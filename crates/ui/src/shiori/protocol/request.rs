//! SHIORI/3.0 リクエストの構築・パース処理

use crate::shiori::types::*;

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// SHIORI/3.0 リクエスト
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ShioriRequest {
    pub method: ShioriMethod,
    pub charset: String,
    pub sender: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub sender_type: Vec<SenderTypeTag>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub security_level: Option<SecurityLevel>,
    /// `SecurityOrigin: null`（情報なし）とヘッダ省略を区別するため `Some(None)` で表現
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub security_origin: Option<Option<String>>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub status: Vec<GhostStatusToken>,
    pub id: String,
    /// 互換可能な基本イベント名（SSP拡張。`OnFirstBoot` → `OnBoot` など）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub base_id: Option<String>,
    /// Reference0..N
    pub references: Vec<String>,
    /// `X-SSTP-PassThru-(後続)` → 値
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub passthru: BTreeMap<String, String>,
}

impl ShioriRequest {
    /// GET（返値前提）リクエストを作る
    pub fn get(id: &str, references: &[String]) -> Self {
        Self {
            method: ShioriMethod::Get,
            charset: "UTF-8".into(),
            sender: "NanaiAndroidMascot".into(),
            id: id.to_string(),
            references: references.to_vec(),
            ..Default::default()
        }
    }

    /// NOTIFY（返値無視）リクエストを作る
    pub fn notify(id: &str, references: &[String]) -> Self {
        let mut req = Self::get(id, references);
        req.method = ShioriMethod::Notify;
        req
    }

    /// テキストから SHIORI/3.0 リクエストをパースする（LF / CRLF 両対応）
    pub fn parse(text: &str) -> Result<Self, String> {
        let mut lines = text.split('\n').map(|l| l.trim_end_matches('\r'));
        let first = lines.next().unwrap_or("");
        let mut fields = first.split_whitespace();
        let method = fields.next().ok_or_else(|| "empty request".to_string())?;
        let version = fields
            .next()
            .ok_or_else(|| "missing protocol".to_string())?;
        if !version.eq_ignore_ascii_case("SHIORI/3.0")
            && !version.eq_ignore_ascii_case("SHIORI/2.6")
        {
            return Err(format!("unsupported protocol version: {}", version));
        }

        let mut req = Self {
            method: ShioriMethod::parse(method),
            ..Default::default()
        };
        req.charset = "UTF-8".into();

        let mut has_id = false;
        for line in lines {
            if line.is_empty() {
                break; // 空行 = ヘッダ終端
            }
            let (key, value) = match line.split_once(':') {
                Some((k, v)) => (k.trim().to_string(), v.trim().to_string()),
                None => continue,
            };
            let lower = key.to_lowercase();
            match lower.as_str() {
                "charset" => req.charset = value,
                "sender" => req.sender = value,
                "sendertype" => req.sender_type = parse_sender_types(&value),
                "securitylevel" => req.security_level = SecurityLevel::parse(&value),
                "securityorigin" => {
                    let origin = if value.eq_ignore_ascii_case("null") {
                        None
                    } else {
                        Some(value.clone())
                    };
                    req.security_origin = Some(origin);
                }
                "status" => req.status = GhostStatusToken::parse_list(&value),
                "id" => {
                    req.id = value;
                    has_id = true;
                }
                "baseid" => req.base_id = Some(value),
                "x-sstp-passthru-markersend" => {}
                _ => {
                    if let Some(rest) = lower.strip_prefix("reference") {
                        if let Ok(idx) = rest.parse::<usize>() {
                            let n = idx;
                            if req.references.len() <= n {
                                req.references.resize(n + 1, String::new());
                            }
                            req.references[n] = value;
                        }
                    } else if let Some(rest) = key.strip_prefix("X-SSTP-PassThru-") {
                        req.passthru.insert(rest.to_string(), value.clone());
                    } else if let Some(rest) = lower.strip_prefix("x-sstp-passthru-") {
                        req.passthru.insert(rest.to_string(), value);
                    }
                }
            }
        }

        if !has_id {
            return Err("ID header is missing".to_string());
        }
        Ok(req)
    }

    /// CR+LF 終端のリクエストテキストを生成する（末尾は空行 CRLF×2）
    pub fn build(&self) -> String {
        let mut out = String::new();
        out.push_str(&format!("{} SHIORI/3.0\r\n", self.method.as_str()));
        out.push_str(&format!("Charset: {}\r\n", self.charset));
        out.push_str(&format!("Sender: {}\r\n", self.sender));
        if !self.sender_type.is_empty() {
            let tokens = self
                .sender_type
                .iter()
                .map(|t| t.token())
                .collect::<Vec<_>>()
                .join(",");
            out.push_str(&format!("SenderType: {}\r\n", tokens));
        }
        if let Some(level) = &self.security_level {
            out.push_str(&format!("SecurityLevel: {}\r\n", level.as_str()));
        }
        if let Some(origin) = &self.security_origin {
            out.push_str(&format!(
                "SecurityOrigin: {}\r\n",
                origin.clone().unwrap_or_else(|| "null".into())
            ));
        }
        if !self.status.is_empty() {
            out.push_str(&format!(
                "Status: {}\r\n",
                GhostStatusToken::write_tokens(&self.status)
            ));
        }
        if let Some(base) = &self.base_id {
            out.push_str(&format!("BaseID: {}\r\n", base));
        }
        out.push_str(&format!("ID: {}\r\n", self.id));
        for (i, r) in self.references.iter().enumerate() {
            out.push_str(&format!("Reference{}: {}\r\n", i, r));
        }
        for (suffix, value) in &self.passthru {
            out.push_str(&format!("X-SSTP-PassThru-{}: {}\r\n", suffix, value));
        }
        out.push_str("\r\n");
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shiori_request_get_and_notify() {
        let get_req = ShioriRequest::get("OnBoot", &["ref0".into()]);
        assert_eq!(get_req.method, ShioriMethod::Get);
        assert_eq!(get_req.id, "OnBoot");
        assert_eq!(get_req.references, vec!["ref0".to_string()]);

        let notify_req = ShioriRequest::notify("OnClose", &[]);
        assert_eq!(notify_req.method, ShioriMethod::Notify);
        assert_eq!(notify_req.id, "OnClose");
    }

    #[test]
    fn test_shiori_request_parse_and_build() {
        let raw = "GET SHIORI/3.0\r\nCharset: UTF-8\r\nSender: TestGhost\r\nID: OnBoot\r\nReference0: val0\r\nReferenceABC: invalid\r\nUnknownHeader: ignored\r\n\r\n";
        let parsed = ShioriRequest::parse(raw).unwrap();
        assert_eq!(parsed.id, "OnBoot");
        assert_eq!(parsed.references[0], "val0");

        let built = parsed.build();
        assert!(built.contains("GET SHIORI/3.0"));
        assert!(built.contains("ID: OnBoot"));
        assert!(built.contains("Reference0: val0"));
    }

    #[test]
    fn test_shiori_request_parse_errors() {
        assert!(ShioriRequest::parse("").is_err());
        assert!(ShioriRequest::parse("GET INVALID/1.0\r\nID: OnBoot\r\n\r\n").is_err());
        assert!(ShioriRequest::parse("GET SHIORI/3.0\r\nCharset: UTF-8\r\n\r\n").is_err());
    }

    #[test]
    fn test_shiori_request_build_all_headers() {
        let mut req = ShioriRequest::get("OnBoot", &["ref0".into()]);
        req.sender_type = vec![SenderTypeTag::Internal];
        req.security_level = Some(SecurityLevel::Local);
        req.security_origin = Some(Some("localhost".into()));
        req.status = vec![GhostStatusToken::Talking];
        req.base_id = Some("OnBootBase".into());
        req.passthru.insert("CustomKey".into(), "CustomVal".into());

        let built = req.build();
        assert!(built.contains("SenderType: internal"));
        assert!(built.contains("SecurityLevel: local"));
        assert!(built.contains("SecurityOrigin: localhost"));
        assert!(built.contains("Status: talking"));
        assert!(built.contains("BaseID: OnBootBase"));
        assert!(built.contains("X-SSTP-PassThru-CustomKey: CustomVal"));

        req.security_origin = Some(None);
        assert!(req.build().contains("SecurityOrigin: null"));
    }
}

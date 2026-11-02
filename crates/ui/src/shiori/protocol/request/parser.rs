//! SHIORI/3.0 リクエストパース処理

use crate::shiori::types::*;
use super::types::ShioriRequest;

impl ShioriRequest {
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
}

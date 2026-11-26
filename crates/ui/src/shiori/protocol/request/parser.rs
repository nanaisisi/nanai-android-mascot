//! SHIORI/3.0 リクエストパース処理

use super::super::super::types::*;
use super::types::ShioriRequest;

impl ShioriRequest {
    /// テキストから SHIORI/3.0 リクエストをパースする（LF / CRLF 両対応）
    pub fn parse(text: &str) -> Result<Self, String> {
        let mut lines = text.split('\n').map(|l| l.trim_end_matches('\r'));
        let first = lines.next().unwrap_or("");
        let method = parse_request_line(first)?;

        let mut req = Self {
            method: ShioriMethod::parse(method),
            charset: "UTF-8".into(),
            ..Default::default()
        };

        let mut has_id = false;
        for line in lines {
            if line.is_empty() {
                break; // 空行 = ヘッダ終端
            }
            let Some((key, value)) = line.split_once(':') else {
                continue;
            };
            if req.apply_header_line(key.trim(), value.trim()) {
                has_id = true;
            }
        }

        if !has_id {
            return Err("ID header is missing".to_string());
        }
        Ok(req)
    }

    fn apply_header_line(&mut self, key: &str, value: &str) -> bool {
        let lower = key.to_lowercase();
        match lower.as_str() {
            "charset" => self.charset = value.to_string(),
            "sender" => self.sender = value.to_string(),
            "sendertype" => self.sender_type = parse_sender_types(value),
            "securitylevel" => self.security_level = SecurityLevel::parse(value),
            "securityorigin" => self.security_origin = Some(parse_security_origin(value)),
            "status" => self.status = GhostStatusToken::parse_list(value),
            "id" => {
                self.id = value.to_string();
                return true;
            }
            "baseid" => self.base_id = Some(value.to_string()),
            "x-sstp-passthru-markersend" => {}
            _ => self.apply_dynamic_header(key, &lower, value),
        }
        false
    }

    fn apply_dynamic_header(&mut self, key: &str, lower: &str, value: &str) {
        if let Some(rest) = lower.strip_prefix("reference") {
            self.apply_reference_header(rest, value);
        } else if let Some(suffix) = extract_passthru_suffix(key, lower) {
            self.passthru.insert(suffix.to_string(), value.to_string());
        }
    }

    fn apply_reference_header(&mut self, index_str: &str, value: &str) {
        if let Ok(idx) = index_str.parse::<usize>() {
            if self.references.len() <= idx {
                self.references.resize(idx + 1, String::new());
            }
            self.references[idx] = value.to_string();
        }
    }
}

fn parse_request_line(first: &str) -> Result<&str, String> {
    let mut fields = first.split_whitespace();
    let method = fields.next().ok_or_else(|| "empty request".to_string())?;
    let version = fields
        .next()
        .ok_or_else(|| "missing protocol".to_string())?;
    if !version.eq_ignore_ascii_case("SHIORI/3.0") && !version.eq_ignore_ascii_case("SHIORI/2.6") {
        return Err(format!("unsupported protocol version: {}", version));
    }
    Ok(method)
}

fn parse_security_origin(value: &str) -> Option<String> {
    if value.eq_ignore_ascii_case("null") {
        None
    } else {
        Some(value.to_string())
    }
}

fn extract_passthru_suffix<'a>(key: &'a str, lower: &'a str) -> Option<&'a str> {
    key.strip_prefix("X-SSTP-PassThru-")
        .or_else(|| lower.strip_prefix("x-sstp-passthru-"))
}

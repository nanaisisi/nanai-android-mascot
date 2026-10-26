//! SHIORI/3.0 レスポンスのパース実装

use super::ShioriResponse;
use super::{is_header_key, key_str_prefix, push_continuation};
use crate::shiori::types::*;

impl ShioriResponse {
    /// テキストから SHIORI/3.0 レスポンスをパースする（LF / CRLF 両対応）
    pub fn parse(text: &str) -> Result<Self, String> {
        let lines = text.split('\n').map(|l| l.trim_end_matches('\r'));
        let mut it = lines.into_iter().peekable();
        let first = it.next().unwrap_or("");
        let mut tokens = first.split_whitespace();
        let proto = tokens.next().unwrap_or("");
        if !proto.eq_ignore_ascii_case("SHIORI/3.0") && !proto.eq_ignore_ascii_case("SHIORI/2.6") {
            return Err(format!("unsupported protocol version: {}", proto));
        }
        let status_code = tokens
            .next()
            .map(|t| t.trim().to_string())
            .and_then(|t| t.parse::<u16>().ok())
            .ok_or_else(|| "missing status code".to_string())?;

        let mut res = Self {
            status: StatusCode::parse(status_code),
            charset: "UTF-8".into(),
            ..Default::default()
        };

        let mut in_value: Option<&str> = None;
        for line in it {
            if line.is_empty() {
                break;
            }
            match line.split_once(':') {
                Some((key, value)) => {
                    let key_ok = !key.trim().contains(char::is_whitespace)
                        || key.trim().starts_with("X-SSTP-");
                    if !key_ok && !is_header_key(key) {
                        push_continuation(&mut res, in_value, line);
                        continue;
                    }
                    let key_l = key.trim().to_lowercase();
                    let value = value.trim();
                    in_value = None;
                    match key_l.as_str() {
                        "charset" => res.charset = value.to_string(),
                        "sender" => res.sender = Some(value.to_string()),
                        "value" => {
                            res.value = Some(value.to_string());
                            in_value = Some("value");
                        }
                        "valuenotify" => {
                            res.value_notify = Some(value.to_string());
                            in_value = Some("value_notify");
                        }
                        "securitylevel" => res.security_level = SecurityLevel::parse(value),
                        "marker" => res.marker = Some(value.to_string()),
                        "markererror" => {}
                        "errorlevel" => res.error_level = ErrorLevel::parse_list(value),
                        "errordescription" => {
                            res.error_description =
                                value.split('\u{1}').map(str::to_string).collect()
                        }
                        "balloonoffset" => {
                            res.balloon_offset = value.split_once(',').and_then(|(x, y)| {
                                Some((x.trim().parse::<i32>().ok()?, y.trim().parse::<i32>().ok()?))
                            });
                        }
                        "reference0" => res.reference0 = Some(value.to_string()),
                        "age" => res.age = value.parse::<u32>().ok(),
                        "markersend" => res.marker_send = Some(value.to_string()),
                        "x-sstp-passthru-markersend" => {}
                        _ => {
                            if let Some(rest) = key_l.strip_prefix("reference") {
                                if let Ok(idx) = rest.parse::<usize>() {
                                    let n = idx.saturating_sub(1);
                                    if res.references.len() <= n {
                                        res.references.resize(n + 1, String::new());
                                    }
                                    res.references[n] = value.to_string();
                                }
                            } else if let Some(rest) = key_str_prefix(key) {
                                res.passthru.insert(rest, value.to_string());
                            }
                        }
                    }
                }
                None => push_continuation(&mut res, in_value, line),
            }
        }

        Ok(res)
    }
}

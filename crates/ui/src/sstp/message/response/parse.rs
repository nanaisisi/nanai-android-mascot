//! SSTP レスポンス文字列パースモジュール

use crate::sstp::types::SstpStatusCode;
use std::collections::HashMap;
use super::SstpResponse;

impl SstpResponse {
    /// 生テキストから SSTP レスポンスをパースする (UKADOC req_res / keepalive 準拠)
    pub fn parse(raw: &str) -> Result<Self, String> {
        let mut lines = raw.lines();
        let first_line = lines.next().ok_or("Empty SSTP response")?.trim();
        if first_line.is_empty() {
            return Err("Empty SSTP response header line".to_string());
        }

        // 例: "SSTP/1.4 200 OK"
        let parts: Vec<&str> = first_line.split_whitespace().collect();
        if parts.len() < 2 {
            return Err(format!("Invalid SSTP response status line: {}", first_line));
        }

        let version = parts[0].to_string();
        let code: u16 = parts[1]
            .parse()
            .map_err(|e| format!("Invalid status code {}: {}", parts[1], e))?;

        let status = SstpStatusCode::from_code(code)
            .ok_or_else(|| format!("Unsupported SSTP status code: {}", code))?;

        let mut charset = "UTF-8".to_string();
        let mut script = None;
        let mut references = HashMap::new();
        let mut pass_thru = HashMap::new();
        let mut error_description = None;
        let mut keep_alive = false;
        let mut keep_alive_timeout = 5u32;
        let mut connection_header = None;
        let mut content_length: Option<usize> = None;

        // ヘッダ読み込み
        let mut body_lines = Vec::new();
        let mut reading_headers = true;

        for line in lines {
            if reading_headers {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    reading_headers = false;
                    continue;
                }
                if let Some((k, v)) = trimmed.split_once(':') {
                    let key = k.trim();
                    let val = v.trim().to_string();
                    let key_lower = key.to_lowercase();

                    if key_lower == "charset" {
                        charset = val;
                    } else if key_lower == "script" {
                        script = Some(val);
                    } else if key_lower == "errordescription" {
                        error_description = Some(val);
                    } else if key_lower == "connection" {
                        connection_header = Some(val.clone());
                        if val.eq_ignore_ascii_case("keep-alive") {
                            keep_alive = true;
                        } else if val.eq_ignore_ascii_case("close") {
                            keep_alive = false;
                        }
                    } else if key_lower == "keep-alive" {
                        if let Some((_, timeout_str)) = val.split_once("timeout=")
                            && let Ok(t) = timeout_str.trim().parse()
                        {
                            keep_alive_timeout = t;
                        }
                    } else if key_lower == "content-length" {
                        content_length = val.parse().ok();
                    } else if key_lower.starts_with("reference")
                        || key_lower.starts_with("argument")
                    {
                        let norm_key = if key_lower.starts_with("argument") {
                            format!("Reference{}", &key[8..])
                        } else {
                            key.to_string()
                        };
                        references.insert(norm_key, val);
                    } else if key_lower.starts_with("x-sstp-passthru-") {
                        pass_thru.insert(key.to_string(), val);
                    }
                }
            } else {
                body_lines.push(line);
            }
        }

        let additional_data = if !body_lines.is_empty() {
            let body_str = body_lines.join("\r\n");
            let trimmed_body = body_str.trim();
            if trimmed_body.is_empty() {
                None
            } else if let Some(len) = content_length {
                if body_str.len() >= len {
                    Some(body_str[..len].to_string())
                } else {
                    Some(trimmed_body.to_string())
                }
            } else {
                Some(trimmed_body.to_string())
            }
        } else {
            None
        };

        Ok(Self {
            version,
            status,
            charset,
            script,
            references,
            pass_thru,
            additional_data,
            error_description,
            keep_alive,
            keep_alive_timeout,
            connection_header,
        })
    }
}

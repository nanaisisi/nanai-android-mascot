//! SSTP (Sakura Script Transfer Protocol) リクエスト/レスポンス処理

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SstpRequest {
    pub command: String, // NOTIFY, EXECUTE, SEND, GIVE
    pub version: String, // SSTP/1.4, SSTP/1.1 等
    pub headers: BTreeMap<String, String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SstpResponse {
    pub status: u16,
    pub version: String,
    pub headers: BTreeMap<String, String>,
    pub script: String,
}

/// SSTP プロトコル文字列をパース
pub fn parse_sstp_request(raw_request: &str) -> Option<SstpRequest> {
    let mut lines = raw_request.lines();
    let first_line = lines.next()?.trim();

    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() < 2 {
        return None;
    }

    let command = parts[0].to_uppercase();
    let version = parts[1].to_string();

    let mut headers = BTreeMap::new();
    for line in lines {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Some((key, val)) = line.split_once(':') {
            headers.insert(key.trim().to_string(), val.trim().to_string());
        }
    }

    Some(SstpRequest {
        command,
        version,
        headers,
    })
}

/// SSTP レスポンス文字列を構築
pub fn build_sstp_response(status: u16, script: &str, headers: BTreeMap<String, String>) -> String {
    let status_text = match status {
        200 => "OK",
        400 => "Bad Request",
        404 => "Not Found",
        _ => "OK",
    };
    let mut resp = format!("SSTP/1.1 {} {}\r\n", status, status_text);
    for (k, v) in &headers {
        resp.push_str(&format!("{}: {}\r\n", k, v));
    }
    if !script.is_empty() {
        resp.push_str(&format!("Script: {}\r\n", script));
    }
    resp.push_str("\r\n");
    resp
}

/// SSTP NOTIFY リクエスト文字列構築 (ukadoc-spec/spec/sstp/method_notify.md)
pub fn build_sstp_notify_request(sender: &str, event_name: &str, references: &[String]) -> String {
    let mut resp = format!(
        "NOTIFY SSTP/1.1\r\nSender: {}\r\nEvent: {}\r\n",
        sender, event_name
    );
    for (i, r) in references.iter().enumerate() {
        resp.push_str(&format!("Reference{}: {}\r\n", i, r));
    }
    resp.push_str("\r\n");
    resp
}

/// SSTP SEND リクエスト文字列構築 (ukadoc-spec/spec/sstp/method_send.md)
pub fn build_sstp_send_request(sender: &str, script: &str) -> String {
    format!(
        "SEND SSTP/1.1\r\nSender: {}\r\nScript: {}\r\n\r\n",
        sender, script
    )
}

/// SSTP EXECUTE リクエスト文字列構築 (ukadoc-spec/spec/sstp/method_execute.md)
pub fn build_sstp_execute_request(sender: &str, command: &str) -> String {
    format!(
        "EXECUTE SSTP/1.1\r\nSender: {}\r\nCommand: {}\r\n\r\n",
        sender, command
    )
}

#[wasm_bindgen]
pub fn wasm_parse_sstp_request(raw_request: &str) -> Result<JsValue, JsValue> {
    if let Some(req) = parse_sstp_request(raw_request) {
        Ok(serde_wasm_bindgen::to_value(&req)?)
    } else {
        Ok(JsValue::NULL)
    }
}

#[wasm_bindgen]
pub fn wasm_build_sstp_response(
    status: u16,
    script: &str,
    headers_js: JsValue,
) -> Result<String, JsValue> {
    let headers: BTreeMap<String, String> = if headers_js.is_null() || headers_js.is_undefined() {
        BTreeMap::new()
    } else {
        serde_wasm_bindgen::from_value(headers_js)?
    };
    Ok(build_sstp_response(status, script, headers))
}

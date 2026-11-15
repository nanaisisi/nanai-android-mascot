//! SSTP (Sakura Script Transfer Protocol) リクエスト/レスポンス処理

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SstpRequest {
    pub(crate) command: String, // NOTIFY, EXECUTE, SEND, GIVE
    pub(crate) version: String, // SSTP/1.4, SSTP/1.1 等
    pub(crate) headers: BTreeMap<String, String>,
}

impl SstpRequest {
    pub fn command(&self) -> &str {
        &self.command
    }

    pub fn version(&self) -> &str {
        &self.version
    }

    pub fn headers(&self) -> &BTreeMap<String, String> {
        &self.headers
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SstpResponse {
    pub(crate) status: u16,
    pub(crate) version: String,
    pub(crate) headers: BTreeMap<String, String>,
    pub(crate) script: String,
}

impl SstpResponse {
    pub fn status(&self) -> u16 {
        self.status
    }

    pub fn version(&self) -> &str {
        &self.version
    }

    pub fn headers(&self) -> &BTreeMap<String, String> {
        &self.headers
    }

    pub fn script(&self) -> &str {
        &self.script
    }
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

#[allow(non_camel_case_types)]
pub struct Build_sstp_notify_requestParams<'a> {
    pub(crate) sender: &'a str,
    pub(crate) event_name: &'a str,
    pub(crate) references: &'a [String],
}

#[allow(dead_code)]
impl<'a> Build_sstp_notify_requestParams<'a> {
    pub fn sender(&self) -> &'a str {
        self.sender
    }

    pub fn event_name(&self) -> &'a str {
        self.event_name
    }

    pub fn references(&self) -> &'a [String] {
        self.references
    }
}

/// SSTP NOTIFY リクエスト文字列構築 (ukadoc-spec/spec/sstp/method_notify.md)
pub fn build_sstp_notify_request(params: Build_sstp_notify_requestParams<'_>) -> String {
    let sender = params.sender();
    let event_name = params.event_name();
    let references = params.references();
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

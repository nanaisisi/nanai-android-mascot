//! SHIORI/3.0 プロトコルリクエスト・イベント通知構築ヘルパー関数群 (UKADOC / SSP 準拠)

pub mod events;
#[cfg(test)]
mod tests;

pub use crate::shiori_protocol_core::*;
pub use events::*;
use std::collections::BTreeMap;
use wasm_bindgen::prelude::*;

/// SHIORI/3.0 リクエスト文字列を構築
pub fn build_shiori_request(method: &str, headers: BTreeMap<String, String>) -> String {
    let mut resp = format!("{} SHIORI/3.0\r\n", method.to_uppercase());
    for (k, v) in &headers {
        resp.push_str(&format!("{}: {}\r\n", k, v));
    }
    resp.push_str("\r\n");
    resp
}

#[allow(non_camel_case_types)]
pub struct Build_shiori_request_extendedParams<'a> {
    pub(crate) method: &'a str,
    pub(crate) event_id: &'a str,
    pub(crate) references: &'a [String],
    pub(crate) params: Option<ShioriExtendedParams>,
}

#[allow(dead_code)]
impl<'a> Build_shiori_request_extendedParams<'a> {
    pub fn method(&self) -> &'a str {
        self.method
    }
    pub fn event_id(&self) -> &'a str {
        self.event_id
    }
    pub fn references(&self) -> &'a [String] {
        self.references
    }
    pub fn params(&self) -> Option<&ShioriExtendedParams> {
        self.params.as_ref()
    }
}

/// UKADOC SHIORI/3.0 仕様に完全準拠した拡張リクエスト文字列構築 (GET / NOTIFY)
pub fn build_shiori_request_extended(params: Build_shiori_request_extendedParams<'_>) -> String {
    let method = params.method();
    let event_id = params.event_id();
    let references = params.references();
    let mut headers = BTreeMap::new();
    let p = params.params().cloned().unwrap_or_default();

    headers.insert(
        "Charset".to_string(),
        p.charset.unwrap_or_else(|| "UTF-8".to_string()),
    );
    headers.insert(
        "Sender".to_string(),
        p.sender.unwrap_or_else(|| "Nanai".to_string()),
    );
    if let Some(st) = p.sender_type {
        headers.insert("SenderType".to_string(), st);
    }
    headers.insert(
        "SecurityLevel".to_string(),
        p.security_level.unwrap_or_else(|| "local".to_string()),
    );
    if let Some(status) = p.status {
        headers.insert("Status".to_string(), status);
    }
    headers.insert("ID".to_string(), event_id.to_string());
    if let Some(bid) = p.base_id {
        headers.insert("BaseID".to_string(), bid);
    }
    for (i, r) in references.iter().enumerate() {
        headers.insert(format!("Reference{}", i), r.clone());
    }

    build_shiori_request(method, headers)
}

/// SHIORI/3.0 イベント通知（NOTIFY）文字列を構築 (Reference0〜N 対応)
pub fn build_shiori_notify(event_name: &str, references: &[String]) -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "NOTIFY",
        event_id: event_name,
        references,
        params: None,
    })
}

#[wasm_bindgen]
pub fn wasm_build_shiori_request(method: &str, headers_js: JsValue) -> Result<String, JsValue> {
    let headers: BTreeMap<String, String> = if headers_js.is_null() || headers_js.is_undefined() {
        BTreeMap::new()
    } else {
        serde_wasm_bindgen::from_value(headers_js)?
    };
    Ok(build_shiori_request(method, headers))
}

#[wasm_bindgen]
pub fn wasm_build_shiori_notify(
    event_name: &str,
    references_js: JsValue,
) -> Result<String, JsValue> {
    let references: Vec<String> = if references_js.is_null() || references_js.is_undefined() {
        vec![]
    } else {
        serde_wasm_bindgen::from_value(references_js)?
    };
    Ok(build_shiori_notify(event_name, &references))
}

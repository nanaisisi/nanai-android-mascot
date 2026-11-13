//! SHIORI/3.0 プロトコルリクエスト・イベント通知構築エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ShioriRequest {
    pub method: String, // GET または NOTIFY
    pub version: String, // SHIORI/3.0
    pub headers: BTreeMap<String, String>,
}

/// SHIORI/3.0 リクエスト文字列を構築
pub fn build_shiori_request(method: &str, headers: BTreeMap<String, String>) -> String {
    let mut resp = format!("{} SHIORI/3.0\r\n", method.to_uppercase());
    for (k, v) in &headers {
        resp.push_str(&format!("{}: {}\r\n", k, v));
    }
    resp.push_str("\r\n");
    resp
}

/// SHIORI/3.0 イベント通知（NOTIFY）文字列を構築 (Reference0〜N 対応)
pub fn build_shiori_notify(event_name: &str, references: &[String]) -> String {
    let mut headers = BTreeMap::new();
    headers.insert("Sender".to_string(), "Nanai".to_string());
    headers.insert("ID".to_string(), event_name.to_string());
    for (i, r) in references.iter().enumerate() {
        headers.insert(format!("Reference{}", i), r.clone());
    }
    build_shiori_request("NOTIFY", headers)
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
pub fn wasm_build_shiori_notify(event_name: &str, references_js: JsValue) -> Result<String, JsValue> {
    let references: Vec<String> = if references_js.is_null() || references_js.is_undefined() {
        vec![]
    } else {
        serde_wasm_bindgen::from_value(references_js)?
    };
    Ok(build_shiori_notify(event_name, &references))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_shiori_request() {
        let mut headers = BTreeMap::new();
        headers.insert("Charset".to_string(), "UTF-8".to_string());
        let req = build_shiori_request("GET", headers);
        assert!(req.contains("GET SHIORI/3.0"));
        assert!(req.contains("Charset: UTF-8"));
    }

    #[test]
    fn test_build_shiori_notify() {
        let refs = vec!["arg0".to_string(), "arg1".to_string()];
        let notify = build_shiori_notify("OnTestEvent", &refs);
        assert!(notify.contains("NOTIFY SHIORI/3.0"));
        assert!(notify.contains("ID: OnTestEvent"));
        assert!(notify.contains("Reference0: arg0"));
        assert!(notify.contains("Reference1: arg1"));
    }
}

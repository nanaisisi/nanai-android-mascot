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

/// UKADOC SHIORI/3.0 仕様に準拠した拡張リクエストパラメータ
#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
pub struct ShioriExtendedParams {
    pub charset: Option<String>,
    pub sender: Option<String>,
    pub sender_type: Option<String>,
    pub security_level: Option<String>,
    pub status: Option<String>,
    pub base_id: Option<String>,
}

/// UKADOC SHIORI/3.0 仕様に完全準拠した拡張リクエスト文字列構築 (GET / NOTIFY)
pub fn build_shiori_request_extended(
    method: &str,
    event_id: &str,
    references: &[String],
    params: Option<ShioriExtendedParams>,
) -> String {
    let mut headers = BTreeMap::new();
    let p = params.unwrap_or_default();

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
    build_shiori_request_extended("NOTIFY", event_name, references, None)
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

    #[test]
    fn test_build_shiori_request_extended() {
        let params = ShioriExtendedParams {
            charset: Some("UTF-8".into()),
            sender: Some("SSP".into()),
            sender_type: Some("internal,raise".into()),
            security_level: Some("local".into()),
            status: Some("choosing,balloon(0=0)".into()),
            base_id: Some("OnBoot".into()),
        };
        let refs = vec!["1".into()];
        let req = build_shiori_request_extended("GET", "OnFirstBoot", &refs, Some(params));
        assert!(req.contains("GET SHIORI/3.0"));
        assert!(req.contains("Sender: SSP"));
        assert!(req.contains("SenderType: internal,raise"));
        assert!(req.contains("SecurityLevel: local"));
        assert!(req.contains("Status: choosing,balloon(0=0)"));
        assert!(req.contains("ID: OnFirstBoot"));
        assert!(req.contains("BaseID: OnBoot"));
        assert!(req.contains("Reference0: 1"));
    }
}

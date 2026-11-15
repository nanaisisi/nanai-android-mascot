//! SAORI/1.0 外部モジュール連携プロトコル

use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

/// SAORI/1.0 リクエスト構築 (UKADOC / SAORI 仕様準拠)
pub fn build_saori_request(module_path: &str, arguments: &[String]) -> String {
    let mut resp = format!(
        "EXECUTE SAORI/1.0\r\nModule: {}\r\nCharset: UTF-8\r\n",
        module_path
    );
    for (i, arg) in arguments.iter().enumerate() {
        resp.push_str(&format!("Argument{}: {}\r\n", i, arg));
    }
    resp.push_str("\r\n");
    resp
}

/// SAORI/1.0 レスポンスパース結果
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SaoriResponse {
    pub status: u16,
    pub charset: String,
    pub result: Option<String>,
    pub values: Vec<String>,
}

/// SAORI/1.0 レスポンス文字列をパース
pub fn parse_saori_response(raw: &str) -> Option<SaoriResponse> {
    let mut lines = raw.lines();
    let first_line = lines.next()?.trim();
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() < 2 || !parts[0].starts_with("SAORI/") {
        return None;
    }
    let status = parts[1].parse::<u16>().ok()?;

    let mut charset = "UTF-8".to_string();
    let mut result = None;
    let mut values = Vec::new();

    for line in lines {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Some((key, val)) = line.split_once(':') {
            let k = key.trim().to_lowercase();
            let v = val.trim().to_string();
            match k.as_str() {
                "charset" => charset = v,
                "result" => result = Some(v),
                _ => {
                    if let Some(rest) = k.strip_prefix("value")
                        && let Ok(idx) = rest.parse::<usize>()
                    {
                        let n = idx;
                        if values.len() <= n {
                            values.resize(n + 1, String::new());
                        }
                        values[n] = v;
                    }
                }
            }
        }
    }

    Some(SaoriResponse {
        status,
        charset,
        result,
        values,
    })
}

#[wasm_bindgen]
pub fn wasm_build_saori_request(module_path: &str, args_js: JsValue) -> Result<String, JsValue> {
    let arguments: Vec<String> = if args_js.is_null() || args_js.is_undefined() {
        vec![]
    } else {
        serde_wasm_bindgen::from_value(args_js)?
    };
    Ok(build_saori_request(module_path, &arguments))
}

#[wasm_bindgen]
pub fn wasm_parse_saori_response(raw: &str) -> Result<JsValue, JsValue> {
    if let Some(res) = parse_saori_response(raw) {
        Ok(serde_wasm_bindgen::to_value(&res)?)
    } else {
        Ok(JsValue::NULL)
    }
}

//! descript.txt パース処理および WASM バインディング

use super::types::DescriptManifest;
use std::collections::BTreeMap;
use wasm_bindgen::prelude::*;

/// descript.txt テキスト文字列を構造化辞書へパース
pub fn parse_descript_text(content: &str) -> DescriptManifest {
    let mut properties = BTreeMap::new();

    for line in content.lines() {
        let line = line.trim();
        // コメント行 (#, //) または空行をスキップ
        if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
            continue;
        }

        if let Some((key, val)) = line.split_once(',') {
            let k = key.trim().to_lowercase();
            let v = val.trim().to_string();
            properties.insert(k, v);
        } else if let Some((key, val)) = line.split_once('=') {
            let k = key.trim().to_lowercase();
            let v = val.trim().to_string();
            properties.insert(k, v);
        }
    }

    DescriptManifest { properties }
}

#[wasm_bindgen]
pub fn wasm_parse_descript(content: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_descript_text(content);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
}

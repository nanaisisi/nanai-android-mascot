//! descript.txt (UKADOC / SSP 仕様準拠) 高速パーサー & プロパティ辞書エンジン

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct DescriptManifest {
    pub properties: BTreeMap<String, String>,
}

impl DescriptManifest {
    pub fn get(&self, key: &str) -> Option<&str> {
        self.properties.get(&key.to_lowercase()).map(|s| s.as_str())
    }
}

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_descript_text_basic() {
        let content = "type,ghost\nname,Emily\ncraftman,Nanai\n# comment\nshiori,yaya.dll\n";
        let manifest = parse_descript_text(content);

        assert_eq!(manifest.get("type"), Some("ghost"));
        assert_eq!(manifest.get("name"), Some("Emily"));
        assert_eq!(manifest.get("craftman"), Some("Nanai"));
        assert_eq!(manifest.get("shiori"), Some("yaya.dll"));
    }

    #[test]
    fn test_parse_descript_text_equals() {
        let content = "charset=UTF-8\nmenu.background.bitmap=menu_bg.png\n";
        let manifest = parse_descript_text(content);

        assert_eq!(manifest.get("charset"), Some("UTF-8"));
        assert_eq!(manifest.get("menu.background.bitmap"), Some("menu_bg.png"));
    }
}

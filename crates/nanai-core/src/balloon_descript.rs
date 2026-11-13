//! バルーン descript.txt プロパティ検証 & 推薦ゴースト判定エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct BalloonDescriptValidationResult {
    pub is_recommended: bool,
    pub warning_message: Option<String>,
}

/// バルーンの descript プロパティを検証し、推薦ゴースト/パスの一致を判定
pub fn validate_balloon_descript(
    properties: &BTreeMap<String, String>,
    current_ghost_name: &str,
    current_ghost_path: &str,
) -> BalloonDescriptValidationResult {
    let get_prop = |key: &str| -> Option<&String> {
        properties.get(&key.to_lowercase())
    };

    let rec_name = get_prop("recommended.ghost").map(|s| s.trim()).filter(|s| !s.is_empty());
    let rec_path = get_prop("recommended.ghost.path").map(|s| s.trim()).filter(|s| !s.is_empty());

    if rec_name.is_none() && rec_path.is_none() {
        return BalloonDescriptValidationResult {
            is_recommended: true,
            warning_message: None,
        };
    }

    let mut is_recommended = true;
    let mut warning = None;

    if let Some(expected_name) = rec_name {
        if !current_ghost_name.is_empty() && !expected_name.eq_ignore_ascii_case(current_ghost_name) {
            is_recommended = false;
            warning = Some(format!(
                "このバルーンスキンは専用/推奨ゴースト「{}」向けに特化して作られています。現在のゴースト「{}」で使用すると表示が狂う場合があります。",
                expected_name, current_ghost_name
            ));
        }
    }

    if let Some(expected_path) = rec_path {
        let norm_expected = expected_path.replace('\\', "/").to_ascii_lowercase();
        let norm_current = current_ghost_path.replace('\\', "/").to_ascii_lowercase();
        if !norm_current.is_empty() && !norm_current.contains(&norm_expected) {
            is_recommended = false;
            if warning.is_none() {
                warning = Some(format!(
                    "このバルーンスキンは専用/推奨ゴーストパス「{}」向けに特化して作られています。",
                    expected_path
                ));
            }
        }
    }

    BalloonDescriptValidationResult {
        is_recommended,
        warning_message: warning,
    }
}

#[wasm_bindgen]
pub fn wasm_validate_balloon_descript(
    props_js: JsValue,
    current_ghost_name: &str,
    current_ghost_path: &str,
) -> Result<JsValue, JsValue> {
    let properties: BTreeMap<String, String> = if props_js.is_null() || props_js.is_undefined() {
        BTreeMap::new()
    } else {
        serde_wasm_bindgen::from_value(props_js)?
    };
    let res = validate_balloon_descript(&properties, current_ghost_name, current_ghost_path);
    Ok(serde_wasm_bindgen::to_value(&res)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_balloon_descript_recommended() {
        let mut props = BTreeMap::new();
        props.insert("recommended.ghost".to_string(), "Emily".to_string());

        let res_match = validate_balloon_descript(&props, "Emily", "ghost/emily");
        assert!(res_match.is_recommended);
        assert!(res_match.warning_message.is_none());

        let res_mismatch = validate_balloon_descript(&props, "Sakura", "ghost/sakura");
        assert!(!res_mismatch.is_recommended);
        assert!(res_mismatch.warning_message.is_some());
    }
}

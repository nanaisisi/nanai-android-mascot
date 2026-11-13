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

    if let Some(expected_name) = rec_name
        && !current_ghost_name.is_empty() && !expected_name.eq_ignore_ascii_case(current_ghost_name) {
            is_recommended = false;
            warning = Some(format!(
                "このバルーンスキンは専用/推奨ゴースト「{}」向けに特化して作られています。現在のゴースト「{}」で使用すると表示が狂う場合があります。",
                expected_name, current_ghost_name
            ));
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

/// バルーンオプションファイル (`balloons*s.txt` / `balloonk*s.txt`) 構造化マニフェスト (UKADOC 準拠)
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct BalloonOptionsManifest {
    pub properties: BTreeMap<String, String>,
}

impl BalloonOptionsManifest {
    pub fn get(&self, key: &str) -> Option<&str> {
        self.properties.get(&key.to_lowercase()).map(|s| s.as_str())
    }

    /// 吹き出しの矢印（しっぽ）画像ファイル名 (`arrow.filename`)
    pub fn arrow_filename(&self) -> Option<&str> {
        self.get("arrow.filename")
    }

    /// クリック待ちマーカー画像ファイル名 (`marker.filename`)
    pub fn marker_filename(&self) -> Option<&str> {
        self.get("marker.filename")
    }

    /// クリック待ち(常時/ウェイト完了)マーカー画像ファイル名 (`clickwaitmarker.filename`)
    pub fn click_wait_marker_filename(&self) -> Option<&str> {
        self.get("clickwaitmarker.filename")
    }

    /// オンライン通信中マーカー画像ファイル名 (`onlinemarker.filename`)
    pub fn online_marker_filename(&self) -> Option<&str> {
        self.get("onlinemarker.filename")
    }

    /// SSTP受信マーカー画像ファイル名 (`sstpmarker.filename`)
    pub fn sstp_marker_filename(&self) -> Option<&str> {
        self.get("sstpmarker.filename")
    }
}

/// balloons*s.txt / balloonk*s.txt テキストのパース
pub fn parse_balloon_options_text(content: &str) -> BalloonOptionsManifest {
    let mut properties = BTreeMap::new();
    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
            continue;
        }
        if let Some((key, val)) = line.split_once(',').or_else(|| line.split_once('=')) {
            let k = key.trim().to_lowercase();
            let v = val.trim().to_string();
            properties.insert(k, v);
        }
    }
    BalloonOptionsManifest { properties }
}

#[wasm_bindgen]
pub fn wasm_parse_balloon_options(content: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_balloon_options_text(content);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
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

    #[test]
    fn test_parse_balloon_options() {
        let content = "arrow.filename,arrow.png\nmarker.filename=marker.png\nclickwaitmarker.filename,cw.png\nonlinemarker.filename=online.png\nsstpmarker.filename,sstp.png\n";
        let opts = parse_balloon_options_text(content);

        assert_eq!(opts.arrow_filename(), Some("arrow.png"));
        assert_eq!(opts.marker_filename(), Some("marker.png"));
        assert_eq!(opts.click_wait_marker_filename(), Some("cw.png"));
        assert_eq!(opts.online_marker_filename(), Some("online.png"));
        assert_eq!(opts.sstp_marker_filename(), Some("sstp.png"));
    }
}

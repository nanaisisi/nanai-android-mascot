//! ネットワーク更新プロトコルヘルパーおよびマニフェストパーサー

use super::types::{DeleteTxtManifest, DeveloperOptionsManifest, UpdateProgressResult};
use std::collections::BTreeMap;
use wasm_bindgen::prelude::*;

/// ネットワーク更新理由のバリデーション・正規化 (UKADOC「ネットワーク更新理由」準拠)
pub fn normalize_update_reason(reason: Option<&str>) -> &'static str {
    match reason {
        Some(r) => {
            let trimmed = r.trim();
            if trimmed.eq_ignore_ascii_case("manual") {
                "manual"
            } else if trimmed.eq_ignore_ascii_case("auto") {
                "auto"
            } else if trimmed.eq_ignore_ascii_case("script") {
                "script"
            } else {
                "manual"
            }
        }
        None => "manual",
    }
}

/// developer_options.txt の noupdate ディレクティブ除外判定
pub fn is_no_update_path(path: &str, patterns: &[&str]) -> bool {
    if path.is_empty() || patterns.is_empty() {
        return false;
    }
    let norm_path = path.replace('\\', "/").to_ascii_lowercase();
    patterns.iter().any(|pattern| {
        let pat_norm = pattern.replace('\\', "/").to_ascii_lowercase();
        let pat_trimmed = pat_norm.trim_start_matches('/');
        norm_path == pat_norm || norm_path.ends_with(&format!("/{}", pat_trimmed))
    })
}

/// ネットワーク更新進捗率計算ヘルパー (0除算防御および 0〜100% 整数丸め)
pub fn calculate_update_progress(current: i64, total: i64) -> UpdateProgressResult {
    if total <= 0 {
        return UpdateProgressResult {
            percent: 100,
            is_complete: true,
        };
    }
    let safe_current = current.max(0);
    let clamped = safe_current.min(total);
    let percent = ((clamped as f64 / total as f64) * 100.0).floor() as u32;
    UpdateProgressResult {
        percent,
        is_complete: clamped >= total,
    }
}

/// 例外文字列から UKADOC 準拠の失敗理由を抽出
pub fn parse_error_reason(err: &str) -> &'static str {
    if err.contains("404") {
        "404"
    } else if err.contains("timeout") {
        "timeout"
    } else if err.contains("md5 miss") {
        "md5 miss"
    } else {
        "fileio"
    }
}

/// delete.txt テキストをパース (UKADOC仕様)
pub fn parse_delete_txt(content: &str) -> DeleteTxtManifest {
    let mut patterns = Vec::new();
    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
            continue;
        }
        patterns.push(line.to_string());
    }
    DeleteTxtManifest { patterns }
}

/// developer_options.txt テキストをパース (UKADOC仕様)
pub fn parse_developer_options_txt(content: &str) -> DeveloperOptionsManifest {
    let mut noupdate_patterns = Vec::new();
    let mut properties = BTreeMap::new();

    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
            continue;
        }
        if let Some(path) = line
            .strip_prefix("noupdate:")
            .or_else(|| line.strip_prefix("noupdate="))
        {
            noupdate_patterns.push(path.trim().to_string());
        } else if let Some((key, val)) = line.split_once(':').or_else(|| line.split_once('=')) {
            properties.insert(key.trim().to_lowercase(), val.trim().to_string());
        } else {
            noupdate_patterns.push(line.to_string());
        }
    }

    DeveloperOptionsManifest {
        noupdate_patterns,
        properties,
    }
}

// -----------------------------------------------------------------------------
// WASM C-ABI Functions (No runtime dependency, directly callable from JS / WASM)
// -----------------------------------------------------------------------------

/// WASM C-ABI: 進捗率計算
#[wasm_bindgen]
pub fn wasm_calculate_update_progress(current: i64, total: i64) -> u32 {
    let res = calculate_update_progress(current, total);
    let complete_flag = if res.is_complete { 1u32 } else { 0u32 };
    (res.percent & 0xFFFF) | (complete_flag << 16)
}

#[wasm_bindgen]
pub fn wasm_normalize_update_reason(reason: Option<String>) -> u32 {
    let r_str = reason.as_deref();
    match normalize_update_reason(r_str) {
        "manual" => 0,
        "auto" => 1,
        "script" => 2,
        _ => 0,
    }
}

#[wasm_bindgen]
pub fn wasm_is_no_update_path(path: &str, patterns_str: &str) -> bool {
    let patterns = patterns_str.split('\n').collect::<Vec<_>>();
    is_no_update_path(path, &patterns)
}

#[wasm_bindgen]
pub fn wasm_parse_delete_txt(content: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_delete_txt(content);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
}

#[wasm_bindgen]
pub fn wasm_parse_developer_options_txt(content: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_developer_options_txt(content);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
}

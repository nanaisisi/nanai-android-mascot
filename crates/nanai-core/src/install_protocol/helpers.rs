//! インストール種別正規化、エラー理由判定、および WASM バインディング

use super::types::MultiResourceInstallResult;
use wasm_bindgen::prelude::*;

/// インストール対象種別の正規化 (UKADOC「インストールの識別子」準拠)
pub fn normalize_install_type(install_type: Option<&str>) -> String {
    match install_type {
        Some(t) => {
            let trimmed = t.trim();
            if trimmed.is_empty() {
                "unknown".to_string()
            } else {
                trimmed.to_ascii_lowercase()
            }
        }
        None => "unknown".to_string(),
    }
}

/// 例外文字列から UKADOC 準拠の「インストールの失敗理由」を抽出
pub fn parse_install_error_reason(err: &str) -> &'static str {
    let lower = err.to_ascii_lowercase();
    if lower.contains("password") || lower.contains("パスワード") {
        "password"
    } else if lower.contains("invalid type") || lower.contains("install.txt") {
        "invalid type"
    } else if lower.contains("unsupported") || lower.contains("サポートされていない") {
        "unsupported"
    } else if lower.contains("artificial")
        || lower.contains("cancel")
        || lower.contains("abort")
        || lower.contains("キャンセル")
    {
        "artificial"
    } else if lower.contains("zip-slip")
        || lower.contains("illegal path")
        || lower.contains("traversal")
        || lower.contains("absolute path")
    {
        "invalid path"
    } else if lower.contains("corrupt") || lower.contains("crc") {
        "unlha32 error"
    } else if lower.contains("permission")
        || lower.contains("access denied")
        || lower.contains("write")
        || lower.contains("書き込み")
    {
        "write error"
    } else if lower.contains("format") || lower.contains("invalid") || lower.contains("形式") {
        "format error"
    } else if lower.contains("unlha32") || lower.contains("lha") {
        "unlha32"
    } else {
        "extraction"
    }
}

pub fn is_multi_resource_install(installed_list: &[(String, String)]) -> bool {
    installed_list.len() > 1
}

pub fn build_install_multi_args(installed_list: &[(String, String)]) -> MultiResourceInstallResult {
    let count = installed_list.len().to_string();
    let is_multi = is_multi_resource_install(installed_list);
    MultiResourceInstallResult { count, is_multi }
}

#[wasm_bindgen]
pub fn wasm_parse_install_error_reason(err: &str) -> i32 {
    let reason = parse_install_error_reason(err);
    match reason {
        "unsupported" => 0,
        "extraction" => 1,
        "unlha32" => 2,
        "unlha32 error" => 3,
        "invalid type" => 4,
        "password" => 5,
        "artificial" => 6,
        "write error" => 7,
        "invalid path" => 8,
        "format error" => 9,
        _ => 1,
    }
}

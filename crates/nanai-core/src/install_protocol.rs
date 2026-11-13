//! UKADOC (SSP仕様) 準拠 インストールイベント・引数生成およびエラーハンドリングモジュール
//! TypeScript版 `ui/ts/core/actions/install-protocol.ts` から移植されたRust/WASMコア実装。

/// UKADOC仕様: インストールの識別子 (Install Identifiers)
pub const INSTALL_IDENTIFIERS: &[&str] = &[
    "ghost",
    "shell",
    "balloon",
    "plugin",
    "headline",
    "package",
    "supplement",
    "calendar.skin",
    "calendar.plugin",
    "profile",
    "taromime",
];

/// UKADOC仕様: インストールの失敗理由 (Install Reasons of Failure)
pub const INSTALL_FAILURE_REASONS: &[&str] = &[
    "unsupported",
    "extraction",
    "unlha32 error",
    "artificial",
    "write error",
    "invalid path",
    "format error",
];

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

/// OnInstallBegin SHIORI 引数生成
/// [Ref0] -> ["install"] または 指定識別子
pub fn build_install_begin_args(identifier: Option<&str>) -> [String; 1] {
    [identifier.unwrap_or("install").to_string()]
}

/// OnInstallComplete SHIORI 引数生成
/// [Ref0=種別, Ref1=名前, Ref2=追加情報(任意)]
pub fn build_install_complete_args(
    install_type: &str,
    name: &str,
    extra: Option<&str>,
) -> [String; 3] {
    [
        normalize_install_type(Some(install_type)),
        name.to_string(),
        extra.unwrap_or("").to_string(),
    ]
}

/// OnInstallCompleteEx SHIORI 引数生成 (UKADOC拡張)
/// [Ref0=種別, Ref1=名前, Ref2=インストール先パス/情報, Ref3=実行スクリプト]
pub fn build_install_complete_ex_args(
    install_type: &str,
    name: &str,
    path_or_extra: Option<&str>,
    on_install_script: Option<&str>,
) -> [String; 4] {
    [
        normalize_install_type(Some(install_type)),
        name.to_string(),
        path_or_extra.unwrap_or("").to_string(),
        on_install_script.unwrap_or("").to_string(),
    ]
}

/// OnInstallCompleteAll SHIORI 引数生成 (複数リソース一括展開完了時)
/// [Ref0=インストール件数, Ref1=インストール結果一覧 (種別\1名前)]
pub fn build_install_complete_all_args(installed_list: &[(String, String)]) -> [String; 2] {
    let count = installed_list.len().to_string();
    let sep = '\u{0001}'; // Byte1
    let list_str = installed_list
        .iter()
        .map(|(t, n)| format!("{}{}{}", normalize_install_type(Some(t)), sep, n))
        .collect::<Vec<_>>()
        .join("\n");
    [count, list_str]
}

/// OnInstallRefuse SHIORI 引数生成 (accept不一致や拒否条件合致時)
/// [Ref0=理由, Ref1=対象リソース/名前]
pub fn build_install_refuse_args(reason: Option<&str>, target: Option<&str>) -> [String; 2] {
    let safe_reason = match reason {
        Some(r) if !r.trim().is_empty() => r.trim(),
        _ => "refused",
    };
    [safe_reason.to_string(), target.unwrap_or("").to_string()]
}

/// OnInstallReroute SHIORI 引数生成 (別ゴーストへの転送指定時)
/// [Ref0=転送先ゴースト名, Ref1=種別, Ref2=名前]
pub fn build_install_reroute_args(
    target_ghost: &str,
    install_type: &str,
    name: &str,
) -> [String; 3] {
    [
        target_ghost.to_string(),
        normalize_install_type(Some(install_type)),
        name.to_string(),
    ]
}

/// 例外文字列から UKADOC 準拠の「インストールの失敗理由」を抽出
pub fn parse_install_error_reason(err: &str) -> &'static str {
    let lower = err.to_ascii_lowercase();
    if lower.contains("unsupported")
        || lower.contains("invalid type")
        || lower.contains("サポートされていない")
    {
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
    } else if lower.contains("unlha32")
        || lower.contains("lha")
        || lower.contains("corrupt")
        || lower.contains("crc")
    {
        "unlha32 error"
    } else if lower.contains("write error")
        || lower.contains("fileio")
        || lower.contains("permission denied")
        || lower.contains("io error")
    {
        "write error"
    } else {
        "extraction"
    }
}

/// OnInstallFailure SHIORI 引数生成
/// [Ref0=失敗理由]
pub fn build_install_failure_args(error_or_reason: &str) -> [String; 1] {
    [parse_install_error_reason(error_or_reason).to_string()]
}

/// 複数リソース同時展開（同時インストール）の判定
pub fn is_multi_resource_install(resources: &[(String, String)]) -> bool {
    resources.len() > 1
}

/// 同時インストール時のSHIORI引数構築 (OnInstallCompleteAll 連携)
pub struct MultiInstallResult {
    pub count: String,
    pub list_text: String,
    pub is_multi: bool,
}

pub fn build_install_multi_args(resources: &[(String, String)]) -> MultiInstallResult {
    let [count, list_text] = build_install_complete_all_args(resources);
    let is_multi = is_multi_resource_install(resources);
    MultiInstallResult {
        count,
        list_text,
        is_multi,
    }
}

// -----------------------------------------------------------------------------
// WASM C-ABI Functions (No runtime dependency, directly callable from JS / WASM)
// -----------------------------------------------------------------------------

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn wasm_parse_install_error_reason(err_message: &str) -> u32 {
    match parse_install_error_reason(err_message) {
        "unsupported" => 1,
        "artificial" => 2,
        "invalid path" => 3,
        "unlha32 error" => 4,
        "write error" => 5,
        _ => 0, // extraction
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_install_type() {
        assert_eq!(normalize_install_type(Some("ghost")), "ghost");
        assert_eq!(normalize_install_type(Some("SHELL")), "shell");
        assert_eq!(normalize_install_type(Some(" Balloon ")), "balloon");
        assert_eq!(normalize_install_type(Some("custom_type")), "custom_type");
        assert_eq!(normalize_install_type(Some("")), "unknown");
        assert_eq!(normalize_install_type(None), "unknown");
    }

    #[test]
    fn test_build_install_begin_args() {
        assert_eq!(build_install_begin_args(None), ["install"]);
        assert_eq!(build_install_begin_args(Some("package")), ["package"]);
    }

    #[test]
    fn test_build_install_complete_args() {
        let args = build_install_complete_args("ghost", "Emily", Some("extra_path"));
        assert_eq!(args, ["ghost", "Emily", "extra_path"]);

        let def_args = build_install_complete_args("shell", "Master", None);
        assert_eq!(def_args, ["shell", "Master", ""]);
    }

    #[test]
    fn test_build_install_complete_ex_args() {
        let args = build_install_complete_ex_args(
            "balloon",
            "Simple",
            Some("path/to/balloon"),
            Some("\\0\\s0Installed!\\e"),
        );
        assert_eq!(
            args,
            [
                "balloon",
                "Simple",
                "path/to/balloon",
                "\\0\\s0Installed!\\e"
            ]
        );
    }

    #[test]
    fn test_build_install_complete_all_args() {
        let list = vec![
            ("ghost".to_string(), "Emily".to_string()),
            ("balloon".to_string(), "Simple".to_string()),
        ];
        let [count, result] = build_install_complete_all_args(&list);
        assert_eq!(count, "2");
        assert_eq!(result, "ghost\u{0001}Emily\nballoon\u{0001}Simple");
    }

    #[test]
    fn test_build_install_refuse_args() {
        let args = build_install_refuse_args(Some("invalid name"), Some("target_ghost"));
        assert_eq!(args, ["invalid name", "target_ghost"]);

        let def = build_install_refuse_args(None, None);
        assert_eq!(def, ["refused", ""]);
    }

    #[test]
    fn test_build_install_reroute_args() {
        let args = build_install_reroute_args("Emily", "shell", "Master");
        assert_eq!(args, ["Emily", "shell", "Master"]);
    }

    #[test]
    fn test_parse_install_error_reason() {
        assert_eq!(
            parse_install_error_reason("Archive error: unsupported format"),
            "unsupported"
        );
        assert_eq!(
            parse_install_error_reason("User abort operation"),
            "artificial"
        );
        assert_eq!(
            parse_install_error_reason("Detected Zip-Slip attempt"),
            "invalid path"
        );
        assert_eq!(
            parse_install_error_reason("Corrupt lha archive header"),
            "unlha32 error"
        );
        assert_eq!(
            parse_install_error_reason("Permission denied write error"),
            "write error"
        );
        assert_eq!(
            parse_install_error_reason("Unknown internal error"),
            "extraction"
        );
    }

    #[test]
    fn test_multi_resource_install() {
        let single = vec![("ghost".to_string(), "Emily".to_string())];
        assert!(!is_multi_resource_install(&single));

        let multi = vec![
            ("ghost".to_string(), "Emily".to_string()),
            ("shell".to_string(), "Master".to_string()),
        ];
        assert!(is_multi_resource_install(&multi));

        let res = build_install_multi_args(&multi);
        assert_eq!(res.count, "2");
        assert!(res.is_multi);
    }

    #[test]
    fn test_wasm_install_abi() {
        assert_eq!(
            wasm_parse_install_error_reason("zip-slip detected"),
            3 // invalid path
        );

        assert_eq!(
            wasm_parse_install_error_reason("cancel by user"),
            2 // artificial
        );
    }
}

//! UKADOC (SSP仕様) 準拠 ネットワーク更新プロトコルのメッセージ・イベント引数構築モジュール
//! TypeScript版 `ui/ts/core/actions/update-protocol.ts` から移植されたRust/WASMコア実装。

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;
use crate::shiori_protocol::build_shiori_request_extended;

/// UKADOC仕様: ネットワーク更新対象の種別 (Update Target Types)
pub const UPDATE_TARGET_TYPES: &[&str] = &["ghost", "shell", "balloon", "plugin", "headline"];

/// UKADOC仕様: ネットワーク更新理由 (Update Reasons / Modes)
pub const UPDATE_REASONS: &[&str] = &["manual", "auto", "script"];

/// UKADOC仕様: ネットワーク更新成功理由 (Update Complete Results)
pub const UPDATE_RESULT_COMPLETE: &[&str] = &["none", "changed"];

/// UKADOC仕様: ネットワーク失敗理由 (Update Result Failure Reasons)
pub const UPDATE_RESULT_FAILURE_REASONS: &[&str] = &[
    "timeout",
    "404",
    "md5 miss",
    "fileio",
    "artificial",
    "readonly",
];

/// UKADOC仕様: ネットワーク更新イベントの発生順序 (Update Event Order)
pub const UPDATE_EVENT_ORDER: &[&str] = &[
    "OnUpdateProcessExec",
    "OnUpdateBegin",
    "OnUpdateReady",
    "OnUpdate.OnDownloadBegin",
    "OnUpdate.OnMD5CompareBegin",
    "OnUpdate.OnMD5CompareComplete",
    "OnUpdateComplete",
];

/// ネットワーク更新進捗計算結果
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct UpdateProgressResult {
    pub percent: u32,
    pub is_complete: bool,
}

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

/// ネットワーク更新標準 SHIORI 引数生成ヘルパー (UKADOC準拠)
/// [Ref0, Ref1, Ref2, Ref3, Ref4] -> [ref0, ref1, "", "ghost", "manual"]
pub fn build_update_args(
    ref0: &str,
    ref1: &str,
    update_target: Option<&str>,
    update_mode: Option<&str>,
) -> [String; 5] {
    let target = update_target.unwrap_or("ghost");
    let mode = update_mode.unwrap_or("manual");
    [
        ref0.to_string(),
        ref1.to_string(),
        String::new(),
        target.to_string(),
        mode.to_string(),
    ]
}

/// OnUpdateComplete SHIORI 引数生成 (UKADOC準拠)
/// [Ref0=成功理由("none"|"changed"), Ref1=更新ファイル数/一覧, Ref2="", Ref3="ghost", Ref4="manual"]
pub fn build_update_complete_args(
    result: Option<&str>,
    updated_files_count: usize,
    update_target: Option<&str>,
    update_mode: Option<&str>,
) -> [String; 5] {
    let norm_result = match result {
        Some(r) if r.eq_ignore_ascii_case("changed") => "changed",
        _ => "none",
    };
    let target = update_target.unwrap_or("ghost");
    let mode = update_mode.unwrap_or("manual");
    [
        norm_result.to_string(),
        updated_files_count.to_string(),
        String::new(),
        target.to_string(),
        mode.to_string(),
    ]
}

/// OnUpdateFailure SHIORI 引数生成 (UKADOC準拠)
/// [Ref0=失敗理由, Ref1=失敗ファイルパス/詳細, Ref2="", Ref3="ghost", Ref4="manual"]
pub fn build_update_failure_args(
    error_or_reason: &str,
    failed_path: Option<&str>,
    update_target: Option<&str>,
    update_mode: Option<&str>,
) -> [String; 5] {
    let reason = parse_error_reason(error_or_reason);
    let path = failed_path.unwrap_or("");
    let target = update_target.unwrap_or("ghost");
    let mode = update_mode.unwrap_or("manual");
    [
        reason.to_string(),
        path.to_string(),
        String::new(),
        target.to_string(),
        mode.to_string(),
    ]
}

/// OnUpdateOther* (外部リソース: shell, balloon, plugin 等) 標準引数生成
/// [Ref0=対象名, Ref1=種別, Ref2=バージョン/追加情報, Ref3=モード]
pub fn build_update_other_args(
    target_name: &str,
    target_type: Option<&str>,
    detail: Option<&str>,
    mode: Option<&str>,
) -> [String; 4] {
    let t_type = target_type.unwrap_or("shell");
    let det = detail.unwrap_or("");
    let m = mode.unwrap_or("manual");
    [
        target_name.to_string(),
        t_type.to_string(),
        det.to_string(),
        m.to_string(),
    ]
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

/// delete.txt のパース結果（削除対象ファイルパターン一覧）
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct DeleteTxtManifest {
    pub patterns: Vec<String>,
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

#[wasm_bindgen]
pub fn wasm_parse_delete_txt(content: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_delete_txt(content);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
}

/// developer_options.txt のパース結果（開発者オプション・除外設定）
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct DeveloperOptionsManifest {
    pub noupdate_patterns: Vec<String>,
    pub properties: BTreeMap<String, String>,
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
        if let Some(path) = line.strip_prefix("noupdate:").or_else(|| line.strip_prefix("noupdate=")) {
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

#[wasm_bindgen]
pub fn wasm_parse_developer_options_txt(content: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_developer_options_txt(content);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
}

/// OnUpdateBegin イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateBegin.md)
pub fn build_on_update_begin_request(update_target: Option<&str>, update_mode: Option<&str>) -> String {
    let args = build_update_args("", "", update_target, update_mode);
    let refs = args.to_vec();
    build_shiori_request_extended("GET", "OnUpdateBegin", &refs, None)
}

/// OnUpdateReady イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateReady.md)
pub fn build_on_update_ready_request(file_count: usize, update_target: Option<&str>, update_mode: Option<&str>) -> String {
    let args = build_update_args(&file_count.to_string(), "", update_target, update_mode);
    let refs = args.to_vec();
    build_shiori_request_extended("GET", "OnUpdateReady", &refs, None)
}

/// OnUpdateComplete イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete.md)
pub fn build_on_update_complete_request(result: Option<&str>, updated_files_count: usize, update_target: Option<&str>, update_mode: Option<&str>) -> String {
    let args = build_update_complete_args(result, updated_files_count, update_target, update_mode);
    let refs = args.to_vec();
    build_shiori_request_extended("GET", "OnUpdateComplete", &refs, None)
}

/// OnUpdateFailure イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure.md)
pub fn build_on_update_failure_request(err: &str, file_name: Option<&str>, update_target: Option<&str>, update_mode: Option<&str>) -> String {
    let args = build_update_failure_args(err, file_name, update_target, update_mode);
    let refs = args.to_vec();
    build_shiori_request_extended("GET", "OnUpdateFailure", &refs, None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_network_update_event_builders() {
        let begin_req = build_on_update_begin_request(Some("ghost"), Some("manual"));
        assert!(begin_req.contains("ID: OnUpdateBegin"));
        assert!(begin_req.contains("Reference3: ghost"));
        assert!(begin_req.contains("Reference4: manual"));

        let ready_req = build_on_update_ready_request(3, Some("shell"), Some("auto"));
        assert!(ready_req.contains("ID: OnUpdateReady"));
        assert!(ready_req.contains("Reference0: 3"));

        let comp_req = build_on_update_complete_request(Some("changed"), 2, Some("ghost"), Some("manual"));
        assert!(comp_req.contains("ID: OnUpdateComplete"));
        assert!(comp_req.contains("Reference0: changed"));
        assert!(comp_req.contains("Reference1: 2"));

        let fail_req = build_on_update_failure_request("404 Not Found", Some("surfaces.png"), Some("ghost"), Some("manual"));
        assert!(fail_req.contains("ID: OnUpdateFailure"));
        assert!(fail_req.contains("Reference0: 404"));
        assert!(fail_req.contains("Reference1: surfaces.png"));
    }

    #[test]
    fn test_parse_delete_and_developer_options() {
        let delete_content = "# comment\ntemp/*.tmp\nold_file.dat\n";
        let del_manifest = parse_delete_txt(delete_content);
        assert_eq!(del_manifest.patterns, vec!["temp/*.tmp".to_string(), "old_file.dat".to_string()]);

        let dev_content = "noupdate: assets/private\ndebug=true\n";
        let dev_manifest = parse_developer_options_txt(dev_content);
        assert_eq!(dev_manifest.noupdate_patterns, vec!["assets/private".to_string()]);
        assert_eq!(dev_manifest.properties.get("debug"), Some(&"true".to_string()));
    }

    #[test]
    fn test_normalize_update_reason() {
        assert_eq!(normalize_update_reason(Some("manual")), "manual");
        assert_eq!(normalize_update_reason(Some("AUTO")), "auto");
        assert_eq!(normalize_update_reason(Some(" Script "),), "script");
        assert_eq!(normalize_update_reason(Some("unknown")), "manual");
        assert_eq!(normalize_update_reason(None), "manual");
    }

    #[test]
    fn test_is_no_update_path() {
        let patterns = vec!["ghost/master/noupdate.txt", "readme.txt"];
        assert!(is_no_update_path("ghost/master/noupdate.txt", &patterns));
        assert!(is_no_update_path("ghost\\master\\noupdate.txt", &patterns));
        assert!(is_no_update_path("dir/readme.txt", &patterns));
        assert!(!is_no_update_path("other.txt", &patterns));
        assert!(!is_no_update_path("", &patterns));
        assert!(!is_no_update_path("ghost/master/noupdate.txt", &[]));
    }

    #[test]
    fn test_calculate_update_progress() {
        let p1 = calculate_update_progress(0, 10);
        assert_eq!(p1.percent, 0);
        assert!(!p1.is_complete);

        let p2 = calculate_update_progress(5, 10);
        assert_eq!(p2.percent, 50);
        assert!(!p2.is_complete);

        let p3 = calculate_update_progress(10, 10);
        assert_eq!(p3.percent, 100);
        assert!(p3.is_complete);

        let p4 = calculate_update_progress(15, 10);
        assert_eq!(p4.percent, 100);
        assert!(p4.is_complete);

        let p5 = calculate_update_progress(0, 0);
        assert_eq!(p5.percent, 100);
        assert!(p5.is_complete);
    }

    #[test]
    fn test_build_update_args() {
        let args = build_update_args("f1", "f2", Some("shell"), Some("auto"));
        assert_eq!(args, ["f1", "f2", "", "shell", "auto"]);

        let def_args = build_update_args("f1", "f2", None, None);
        assert_eq!(def_args, ["f1", "f2", "", "ghost", "manual"]);
    }

    #[test]
    fn test_build_update_complete_args() {
        let args = build_update_complete_args(Some("changed"), 5, None, None);
        assert_eq!(args, ["changed", "5", "", "ghost", "manual"]);

        let def = build_update_complete_args(None, 0, None, None);
        assert_eq!(def, ["none", "0", "", "ghost", "manual"]);
    }

    #[test]
    fn test_build_update_failure_args() {
        let args = build_update_failure_args("HTTP 404 Not Found", Some("file.txt"), None, None);
        assert_eq!(args, ["404", "file.txt", "", "ghost", "manual"]);

        let args_timeout = build_update_failure_args("connection timeout", None, None, None);
        assert_eq!(args_timeout, ["timeout", "", "", "ghost", "manual"]);

        let args_md5 = build_update_failure_args("md5 miss match", None, None, None);
        assert_eq!(args_md5, ["md5 miss", "", "", "ghost", "manual"]);

        let args_io = build_update_failure_args("permission denied", None, None, None);
        assert_eq!(args_io, ["fileio", "", "", "ghost", "manual"]);
    }

    #[test]
    fn test_build_update_other_args() {
        let args = build_update_other_args("master", Some("shell"), Some("v1.0"), Some("script"));
        assert_eq!(args, ["master", "shell", "v1.0", "script"]);
    }

    #[test]
    fn test_wasm_abi() {
        let packed = wasm_calculate_update_progress(5, 10);
        assert_eq!(packed & 0xFFFF, 50);
        assert_eq!((packed >> 16) & 0xFFFF, 0);

        let packed_done = wasm_calculate_update_progress(10, 10);
        assert_eq!(packed_done & 0xFFFF, 100);
        assert_eq!((packed_done >> 16) & 0xFFFF, 1);

        assert_eq!(wasm_normalize_update_reason(Some("auto".to_string())), 1);
        assert_eq!(wasm_normalize_update_reason(Some("script".to_string())), 2);
        assert_eq!(wasm_normalize_update_reason(Some("manual".to_string())), 0);
        assert_eq!(wasm_normalize_update_reason(None), 0);
    }
}

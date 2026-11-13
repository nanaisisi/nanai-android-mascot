//! UKADOC (SSP仕様) 準拠 ネットワーク更新プロトコルのメッセージ・イベント引数構築モジュール
//! TypeScript版 `ui/ts/core/actions/update-protocol.ts` から移植されたRust/WASMコア実装。

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
/// 返り値: (percent & 0xFFFF) | ((is_complete as u32) << 16)
#[unsafe(no_mangle)]
pub extern "C" fn wasm_calculate_update_progress(current: i64, total: i64) -> u32 {
    let res = calculate_update_progress(current, total);
    let complete_flag = if res.is_complete { 1u32 } else { 0u32 };
    (res.percent & 0xFFFF) | (complete_flag << 16)
}

/// WASM C-ABI: 更新理由正規化 (0: manual, 1: auto, 2: script)
///
/// # Safety
/// `ptr` が非NULLかつ `len` が0でない場合、`ptr` は少なくとも `len` バイトの有効なメモリを指している必要があります。
#[unsafe(no_mangle)]
pub unsafe extern "C" fn wasm_normalize_update_reason(ptr: *const u8, len: usize) -> u32 {
    if ptr.is_null() || len == 0 {
        return 0; // manual
    }
    // SAFETY: 呼び出し元が有効なバッファポインタと長さを提供することを前提とする。
    let slice = unsafe { std::slice::from_raw_parts(ptr, len) };
    if let Ok(s) = std::str::from_utf8(slice) {
        match normalize_update_reason(Some(s)) {
            "manual" => 0,
            "auto" => 1,
            "script" => 2,
            _ => 0,
        }
    } else {
        0
    }
}

/// WASM C-ABI: noupdate パス判定
/// # Safety
/// `path_ptr` and `patterns_ptr` must be valid pointer buffers.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn wasm_is_no_update_path(
    path_ptr: *const u8,
    path_len: usize,
    patterns_ptr: *const u8,
    patterns_len: usize,
) -> bool {
    if path_ptr.is_null() || path_len == 0 {
        return false;
    }
    let path_slice = unsafe { std::slice::from_raw_parts(path_ptr, path_len) };
    let Ok(path) = std::str::from_utf8(path_slice) else {
        return false;
    };

    let patterns = if !patterns_ptr.is_null() && patterns_len > 0 {
        let pat_slice = unsafe { std::slice::from_raw_parts(patterns_ptr, patterns_len) };
        if let Ok(pat_str) = std::str::from_utf8(pat_slice) {
            pat_str.split('\n').collect::<Vec<_>>()
        } else {
            vec![]
        }
    } else {
        vec![]
    };

    is_no_update_path(path, &patterns)
}

#[cfg(test)]
mod tests {
    use super::*;

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

        let s_auto = b"auto";
        assert_eq!(
            unsafe { wasm_normalize_update_reason(s_auto.as_ptr(), s_auto.len()) },
            1
        );

        let s_script = b"script";
        assert_eq!(
            unsafe { wasm_normalize_update_reason(s_script.as_ptr(), s_script.len()) },
            2
        );

        let s_man = b"manual";
        assert_eq!(
            unsafe { wasm_normalize_update_reason(s_man.as_ptr(), s_man.len()) },
            0
        );

        assert_eq!(
            unsafe { wasm_normalize_update_reason(std::ptr::null(), 0) },
            0
        );
    }
}

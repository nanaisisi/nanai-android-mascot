//! ネットワーク更新 SHIORI イベント・引数構築処理

use super::helpers::parse_error_reason;
use crate::shiori_protocol::{build_shiori_request_extended, Build_shiori_request_extendedParams};

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

/// OnUpdateBegin イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateBegin.md)
pub fn build_on_update_begin_request(
    update_target: Option<&str>,
    update_mode: Option<&str>,
) -> String {
    let args = build_update_args("", "", update_target, update_mode);
    let refs = args.to_vec();
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUpdateBegin",
        references: &refs,
        params: None,
    })
}

/// OnUpdateReady イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateReady.md)
pub fn build_on_update_ready_request(
    file_count: usize,
    update_target: Option<&str>,
    update_mode: Option<&str>,
) -> String {
    let args = build_update_args(&file_count.to_string(), "", update_target, update_mode);
    let refs = args.to_vec();
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUpdateReady",
        references: &refs,
        params: None,
    })
}

/// OnUpdateComplete イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete.md)
pub fn build_on_update_complete_request(
    result: Option<&str>,
    updated_files_count: usize,
    update_target: Option<&str>,
    update_mode: Option<&str>,
) -> String {
    let args = build_update_complete_args(result, updated_files_count, update_target, update_mode);
    let refs = args.to_vec();
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUpdateComplete",
        references: &refs,
        params: None,
    })
}

/// OnUpdateFailure イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure.md)
pub fn build_on_update_failure_request(
    err: &str,
    file_name: Option<&str>,
    update_target: Option<&str>,
    update_mode: Option<&str>,
) -> String {
    let args = build_update_failure_args(err, file_name, update_target, update_mode);
    let refs = args.to_vec();
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUpdateFailure",
        references: &refs,
        params: None,
    })
}

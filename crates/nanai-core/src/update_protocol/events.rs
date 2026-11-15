//! ネットワーク更新 SHIORI イベント・引数構築処理

use super::helpers::parse_error_reason;
use crate::shiori_protocol::{Build_shiori_request_extendedParams, build_shiori_request_extended};

#[allow(non_camel_case_types)]
pub struct Build_update_argsParams<'a> {
    pub ref0: &'a str,
    pub ref1: &'a str,
    pub update_target: Option<&'a str>,
    pub update_mode: Option<&'a str>,
}

/// ネットワーク更新標準 SHIORI 引数生成ヘルパー (UKADOC準拠)
/// [Ref0, Ref1, Ref2, Ref3, Ref4] -> [ref0, ref1, "", "ghost", "manual"]
pub fn build_update_args(params: Build_update_argsParams<'_>) -> [String; 5] {
    let ref0 = params.ref0;
    let ref1 = params.ref1;
    let target = params.update_target.unwrap_or("ghost");
    let mode = params.update_mode.unwrap_or("manual");
    [
        ref0.to_string(),
        ref1.to_string(),
        String::new(),
        target.to_string(),
        mode.to_string(),
    ]
}

#[allow(non_camel_case_types)]
pub struct Build_update_complete_argsParams<'a> {
    pub result: Option<&'a str>,
    pub updated_files_count: usize,
    pub update_target: Option<&'a str>,
    pub update_mode: Option<&'a str>,
}

/// OnUpdateComplete SHIORI 引数生成 (UKADOC準拠)
/// [Ref0=成功理由("none"|"changed"), Ref1=更新ファイル数/一覧, Ref2="", Ref3="ghost", Ref4="manual"]
pub fn build_update_complete_args(params: Build_update_complete_argsParams<'_>) -> [String; 5] {
    let result = params.result;
    let updated_files_count = params.updated_files_count;
    let norm_result = match result {
        Some(r) if r.eq_ignore_ascii_case("changed") => "changed",
        _ => "none",
    };
    let target = params.update_target.unwrap_or("ghost");
    let mode = params.update_mode.unwrap_or("manual");
    [
        norm_result.to_string(),
        updated_files_count.to_string(),
        String::new(),
        target.to_string(),
        mode.to_string(),
    ]
}

#[allow(non_camel_case_types)]
pub struct Build_update_failure_argsParams<'a> {
    pub error_or_reason: &'a str,
    pub failed_path: Option<&'a str>,
    pub update_target: Option<&'a str>,
    pub update_mode: Option<&'a str>,
}

/// OnUpdateFailure SHIORI 引数生成 (UKADOC準拠)
/// [Ref0=失敗理由, Ref1=失敗ファイルパス/詳細, Ref2="", Ref3="ghost", Ref4="manual"]
pub fn build_update_failure_args(params: Build_update_failure_argsParams<'_>) -> [String; 5] {
    let error_or_reason = params.error_or_reason;
    let failed_path = params.failed_path;
    let reason = parse_error_reason(error_or_reason);
    let path = failed_path.unwrap_or("");
    let target = params.update_target.unwrap_or("ghost");
    let mode = params.update_mode.unwrap_or("manual");
    [
        reason.to_string(),
        path.to_string(),
        String::new(),
        target.to_string(),
        mode.to_string(),
    ]
}

#[allow(non_camel_case_types)]
pub struct Build_update_other_argsParams<'a> {
    pub target_name: &'a str,
    pub target_type: Option<&'a str>,
    pub detail: Option<&'a str>,
    pub mode: Option<&'a str>,
}

/// OnUpdateOther* (外部リソース: shell, balloon, plugin 等) 標準引数生成
/// [Ref0=対象名, Ref1=種別, Ref2=バージョン/追加情報, Ref3=モード]
pub fn build_update_other_args(params: Build_update_other_argsParams<'_>) -> [String; 4] {
    let target_name = params.target_name;
    let t_type = params.target_type.unwrap_or("shell");
    let det = params.detail.unwrap_or("");
    let m = params.mode.unwrap_or("manual");
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
    let args = build_update_args(Build_update_argsParams {
        ref0: "",
        ref1: "",
        update_target,
        update_mode,
    });
    let refs = args.to_vec();
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUpdateBegin",
        references: &refs,
        params: None,
    })
}

#[allow(non_camel_case_types)]
pub struct Build_on_update_ready_requestParams<'a> {
    pub file_count: usize,
    pub update_target: Option<&'a str>,
    pub update_mode: Option<&'a str>,
}

/// OnUpdateReady イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateReady.md)
pub fn build_on_update_ready_request(
    params: Build_on_update_ready_requestParams<'_>,
) -> String {
    let file_count = params.file_count;
    let update_target = params.update_target;
    let update_mode = params.update_mode;
    let file_count_str = file_count.to_string();
    let args = build_update_args(Build_update_argsParams {
        ref0: &file_count_str,
        ref1: "",
        update_target,
        update_mode,
    });
    let refs = args.to_vec();
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUpdateReady",
        references: &refs,
        params: None,
    })
}

#[allow(non_camel_case_types)]
pub struct Build_on_update_complete_requestParams<'a> {
    pub result: Option<&'a str>,
    pub updated_files_count: usize,
    pub update_target: Option<&'a str>,
    pub update_mode: Option<&'a str>,
}

/// OnUpdateComplete イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete.md)
pub fn build_on_update_complete_request(
    params: Build_on_update_complete_requestParams<'_>,
) -> String {
    let result = params.result;
    let updated_files_count = params.updated_files_count;
    let update_target = params.update_target;
    let update_mode = params.update_mode;
    let args = build_update_complete_args(Build_update_complete_argsParams {
        result,
        updated_files_count,
        update_target,
        update_mode,
    });
    let refs = args.to_vec();
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUpdateComplete",
        references: &refs,
        params: None,
    })
}

#[allow(non_camel_case_types)]
pub struct Build_on_update_failure_requestParams<'a> {
    pub err: &'a str,
    pub file_name: Option<&'a str>,
    pub update_target: Option<&'a str>,
    pub update_mode: Option<&'a str>,
}

/// OnUpdateFailure イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure.md)
pub fn build_on_update_failure_request(
    params: Build_on_update_failure_requestParams<'_>,
) -> String {
    let err = params.err;
    let file_name = params.file_name;
    let update_target = params.update_target;
    let update_mode = params.update_mode;
    let args = build_update_failure_args(Build_update_failure_argsParams {
        error_or_reason: err,
        failed_path: file_name,
        update_target,
        update_mode,
    });
    let refs = args.to_vec();
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUpdateFailure",
        references: &refs,
        params: None,
    })
}

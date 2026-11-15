//! ネットワーク更新 SHIORI イベントリクエスト文字列構築関数群

use super::args::{
    Build_update_argsParams, Build_update_complete_argsParams, Build_update_failure_argsParams,
    build_update_args, build_update_complete_args, build_update_failure_args,
};
use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

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
    pub(crate) file_count: usize,
    pub(crate) update_target: Option<&'a str>,
    pub(crate) update_mode: Option<&'a str>,
}

#[allow(dead_code)]
impl<'a> Build_on_update_ready_requestParams<'a> {
    pub fn file_count(&self) -> usize {
        self.file_count
    }
    pub fn update_target(&self) -> Option<&'a str> {
        self.update_target
    }
    pub fn update_mode(&self) -> Option<&'a str> {
        self.update_mode
    }
}

/// OnUpdateReady イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateReady.md)
pub fn build_on_update_ready_request(params: Build_on_update_ready_requestParams<'_>) -> String {
    let file_count = params.file_count();
    let update_target = params.update_target();
    let update_mode = params.update_mode();
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
    pub(crate) result: Option<&'a str>,
    pub(crate) updated_files_count: usize,
    pub(crate) update_target: Option<&'a str>,
    pub(crate) update_mode: Option<&'a str>,
}

#[allow(dead_code)]
impl<'a> Build_on_update_complete_requestParams<'a> {
    pub fn result(&self) -> Option<&'a str> {
        self.result
    }
    pub fn updated_files_count(&self) -> usize {
        self.updated_files_count
    }
    pub fn update_target(&self) -> Option<&'a str> {
        self.update_target
    }
    pub fn update_mode(&self) -> Option<&'a str> {
        self.update_mode
    }
}

/// OnUpdateComplete イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete.md)
pub fn build_on_update_complete_request(
    params: Build_on_update_complete_requestParams<'_>,
) -> String {
    let result = params.result();
    let updated_files_count = params.updated_files_count();
    let update_target = params.update_target();
    let update_mode = params.update_mode();
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
    pub(crate) err: &'a str,
    pub(crate) file_name: Option<&'a str>,
    pub(crate) update_target: Option<&'a str>,
    pub(crate) update_mode: Option<&'a str>,
}

#[allow(dead_code)]
impl<'a> Build_on_update_failure_requestParams<'a> {
    pub fn err(&self) -> &'a str {
        self.err
    }
    pub fn file_name(&self) -> Option<&'a str> {
        self.file_name
    }
    pub fn update_target(&self) -> Option<&'a str> {
        self.update_target
    }
    pub fn update_mode(&self) -> Option<&'a str> {
        self.update_mode
    }
}

/// OnUpdateFailure イベントリクエスト構築 (ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure.md)
pub fn build_on_update_failure_request(
    params: Build_on_update_failure_requestParams<'_>,
) -> String {
    let err = params.err();
    let file_name = params.file_name();
    let update_target = params.update_target();
    let update_mode = params.update_mode();
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

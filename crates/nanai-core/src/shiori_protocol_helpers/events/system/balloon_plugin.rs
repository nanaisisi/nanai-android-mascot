//! バルーン破壊・クローズ・タイムアウトおよび他ゴーストトークイベントビルダー

use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

#[allow(non_camel_case_types)]
pub struct Build_on_other_ghost_talk_requestParams<'a> {
    pub(crate) talker: &'a str,
    pub(crate) listener: &'a str,
    pub(crate) script: &'a str,
}

#[allow(dead_code)]
impl<'a> Build_on_other_ghost_talk_requestParams<'a> {
    pub fn talker(&self) -> &'a str {
        self.talker
    }
    pub fn listener(&self) -> &'a str {
        self.listener
    }
    pub fn script(&self) -> &'a str {
        self.script
    }
}

/// OnOtherGhostTalk プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnOtherGhostTalk.md)
pub fn build_on_other_ghost_talk_request(
    params: Build_on_other_ghost_talk_requestParams<'_>,
) -> String {
    let talker = params.talker();
    let listener = params.listener();
    let script = params.script();
    let refs = vec![talker.to_string(), listener.to_string(), script.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnOtherGhostTalk",
        references: &refs,
        params: None,
    })
}

/// OnBalloonBreak イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonBreak.md)
pub fn build_on_balloon_break_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBalloonBreak",
        references: &refs,
        params: None,
    })
}

/// OnBalloonClose イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonClose.md)
pub fn build_on_balloon_close_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBalloonClose",
        references: &refs,
        params: None,
    })
}

/// OnBalloonTimeout イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonTimeout.md)
pub fn build_on_balloon_timeout_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBalloonTimeout",
        references: &refs,
        params: None,
    })
}

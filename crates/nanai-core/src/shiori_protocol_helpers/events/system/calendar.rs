//! カレンダーおよびスケジュール通知イベントビルダー

use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

/// OnScheduleRead イベントリクエスト構築 (ukadoc-spec/list/shiori-event/calendar/OnScheduleRead.md)
pub fn build_on_schedule_read_request(date_str: &str, title: &str) -> String {
    let refs = vec![date_str.to_string(), title.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnScheduleRead",
        references: &refs,
        params: None,
    })
}

/// OnScheduleTodayNotify イベントリクエスト構築 (ukadoc-spec/list/shiori-event/calendar/OnScheduleTodayNotify.md)
pub fn build_on_schedule_today_notify_request(title: &str) -> String {
    let refs = vec![title.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnScheduleTodayNotify",
        references: &refs,
        params: None,
    })
}

/// OnSchedule5MinutesToGo イベントリクエスト構築 (ukadoc-spec/list/shiori-event/calendar/OnSchedule5MinutesToGo.md)
pub fn build_on_schedule_5minutes_to_go_request(title: &str) -> String {
    let refs = vec![title.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnSchedule5MinutesToGo",
        references: &refs,
        params: None,
    })
}

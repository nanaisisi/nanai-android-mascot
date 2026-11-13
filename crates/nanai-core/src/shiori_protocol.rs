//! SHIORI/3.0 プロトコルリクエスト・イベント通知構築エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ShioriRequest {
    pub method: String, // GET または NOTIFY
    pub version: String, // SHIORI/3.0
    pub headers: BTreeMap<String, String>,
}

/// SHIORI/3.0 リクエスト文字列を構築
pub fn build_shiori_request(method: &str, headers: BTreeMap<String, String>) -> String {
    let mut resp = format!("{} SHIORI/3.0\r\n", method.to_uppercase());
    for (k, v) in &headers {
        resp.push_str(&format!("{}: {}\r\n", k, v));
    }
    resp.push_str("\r\n");
    resp
}

/// UKADOC SHIORI/3.0 仕様に準拠した拡張リクエストパラメータ
#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
pub struct ShioriExtendedParams {
    pub charset: Option<String>,
    pub sender: Option<String>,
    pub sender_type: Option<String>,
    pub security_level: Option<String>,
    pub status: Option<String>,
    pub base_id: Option<String>,
}

/// UKADOC SHIORI/3.0 仕様に完全準拠した拡張リクエスト文字列構築 (GET / NOTIFY)
pub fn build_shiori_request_extended(
    method: &str,
    event_id: &str,
    references: &[String],
    params: Option<ShioriExtendedParams>,
) -> String {
    let mut headers = BTreeMap::new();
    let p = params.unwrap_or_default();

    headers.insert(
        "Charset".to_string(),
        p.charset.unwrap_or_else(|| "UTF-8".to_string()),
    );
    headers.insert(
        "Sender".to_string(),
        p.sender.unwrap_or_else(|| "Nanai".to_string()),
    );
    if let Some(st) = p.sender_type {
        headers.insert("SenderType".to_string(), st);
    }
    headers.insert(
        "SecurityLevel".to_string(),
        p.security_level.unwrap_or_else(|| "local".to_string()),
    );
    if let Some(status) = p.status {
        headers.insert("Status".to_string(), status);
    }
    headers.insert("ID".to_string(), event_id.to_string());
    if let Some(bid) = p.base_id {
        headers.insert("BaseID".to_string(), bid);
    }
    for (i, r) in references.iter().enumerate() {
        headers.insert(format!("Reference{}", i), r.clone());
    }

    build_shiori_request(method, headers)
}

/// SHIORI/3.0 イベント通知（NOTIFY）文字列を構築 (Reference0〜N 対応)
pub fn build_shiori_notify(event_name: &str, references: &[String]) -> String {
    build_shiori_request_extended("NOTIFY", event_name, references, None)
}

/// UKADOC公式仕様 (ukadoc-spec/list/shiori-event) に準拠した標準SHIORIイベントリクエストビルダー群

/// OnBoot / OnFirstBoot イベントリクエスト構築
pub fn build_on_boot_request(is_first_boot: bool, kero_name: &str, ghost_dir: &str) -> String {
    let event_id = if is_first_boot { "OnFirstBoot" } else { "OnBoot" };
    let base_id = if is_first_boot { Some("OnBoot".to_string()) } else { None };
    let refs = vec![
        if is_first_boot { "1".to_string() } else { "0".to_string() },
        kero_name.to_string(),
        ghost_dir.to_string(),
    ];
    let params = ShioriExtendedParams {
        base_id,
        ..Default::default()
    };
    build_shiori_request_extended("GET", event_id, &refs, Some(params))
}

/// OnClose イベントリクエスト構築
pub fn build_on_close_request(reason: u32) -> String {
    let refs = vec![reason.to_string()];
    build_shiori_request_extended("GET", "OnClose", &refs, None)
}

/// OnMouseClick イベントリクエスト構築
pub fn build_on_mouse_click_request(
    x: i32,
    y: i32,
    scope_id: i32,
    collision_name: &str,
    button: i32,
) -> String {
    let refs = vec![
        x.to_string(),
        y.to_string(),
        "0".to_string(),
        scope_id.to_string(),
        collision_name.to_string(),
        button.to_string(),
    ];
    build_shiori_request_extended("GET", "OnMouseClick", &refs, None)
}

/// OnChoiceSelect イベントリクエスト構築
pub fn build_on_choice_select_request(choice_id: &str) -> String {
    let refs = vec![choice_id.to_string()];
    build_shiori_request_extended("GET", "OnChoiceSelect", &refs, None)
}

/// OnShellChanged イベントリクエスト構築
pub fn build_on_shell_changed_request(shell_name: &str) -> String {
    let refs = vec![shell_name.to_string()];
    build_shiori_request_extended("GET", "OnShellChanged", &refs, None)
}

/// OnDressupChanged イベントリクエスト構築
pub fn build_on_dressup_changed_request(
    scope_id: i32,
    category: &str,
    part: &str,
    enabled: bool,
) -> String {
    let refs = vec![
        scope_id.to_string(),
        category.to_string(),
        part.to_string(),
        if enabled { "1".to_string() } else { "0".to_string() },
    ];
    build_shiori_request_extended("GET", "OnDressupChanged", &refs, None)
}

/// OnGhostChanging イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnGhostChanging.md)
pub fn build_on_ghost_changing_request(target_ghost: &str) -> String {
    let refs = vec![target_ghost.to_string()];
    build_shiori_request_extended("GET", "OnGhostChanging", &refs, None)
}

/// OnGhostChanged イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnGhostChanged.md)
pub fn build_on_ghost_changed_request(target_ghost: &str) -> String {
    let refs = vec![target_ghost.to_string()];
    build_shiori_request_extended("GET", "OnGhostChanged", &refs, None)
}

/// OnBalloonChange イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonChange.md)
pub fn build_on_balloon_change_request(balloon_name: &str) -> String {
    let refs = vec![balloon_name.to_string()];
    build_shiori_request_extended("GET", "OnBalloonChange", &refs, None)
}

/// OnBIFFBegin イベントリクエスト構築 (ukadoc-spec/list/shiori-event/biff/OnBIFFBegin.md)
pub fn build_on_biff_request() -> String {
    build_shiori_request_extended("GET", "OnBIFFBegin", &[], None)
}

/// OnFileDrop イベントリクエスト構築 (ukadoc-spec/list/shiori-event/file-drop/OnFileDrop.md)
pub fn build_on_file_drop_request(file_path: &str) -> String {
    let refs = vec![file_path.to_string()];
    build_shiori_request_extended("GET", "OnFileDrop", &refs, None)
}

/// OnFileDropEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/file-drop/OnFileDropEx.md)
pub fn build_on_file_drop_ex_request(file_path: &str, scope_id: i32) -> String {
    let refs = vec![file_path.to_string(), scope_id.to_string()];
    build_shiori_request_extended("GET", "OnFileDropEx", &refs, None)
}

/// OnNarCreating イベントリクエスト構築 (ukadoc-spec/list/shiori-event/file-drop/OnNarCreating.md)
pub fn build_on_nar_creating_request(nar_path: &str) -> String {
    let refs = vec![nar_path.to_string()];
    build_shiori_request_extended("GET", "OnNarCreating", &refs, None)
}

/// OnWallpaperChange イベントリクエスト構築 (ukadoc-spec/list/shiori-event/file-drop/OnWallpaperChange.md)
pub fn build_on_wallpaper_change_request(wallpaper_path: &str) -> String {
    let refs = vec![wallpaper_path.to_string()];
    build_shiori_request_extended("GET", "OnWallpaperChange", &refs, None)
}

/// OnScheduleRead イベントリクエスト構築 (ukadoc-spec/list/shiori-event/calendar/OnScheduleRead.md)
pub fn build_on_schedule_read_request(date_str: &str, title: &str) -> String {
    let refs = vec![date_str.to_string(), title.to_string()];
    build_shiori_request_extended("GET", "OnScheduleRead", &refs, None)
}

/// OnScheduleTodayNotify イベントリクエスト構築 (ukadoc-spec/list/shiori-event/calendar/OnScheduleTodayNotify.md)
pub fn build_on_schedule_today_notify_request(title: &str) -> String {
    let refs = vec![title.to_string()];
    build_shiori_request_extended("GET", "OnScheduleTodayNotify", &refs, None)
}

/// OnSchedule5MinutesToGo イベントリクエスト構築 (ukadoc-spec/list/shiori-event/calendar/OnSchedule5MinutesToGo.md)
pub fn build_on_schedule_5minutes_to_go_request(title: &str) -> String {
    let refs = vec![title.to_string()];
    build_shiori_request_extended("GET", "OnSchedule5MinutesToGo", &refs, None)
}

/// OnGhostBoot プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnGhostBoot.md)
pub fn build_on_ghost_boot_event_request(ghost_name: &str) -> String {
    let refs = vec![ghost_name.to_string()];
    build_shiori_request_extended("GET", "OnGhostBoot", &refs, None)
}

/// OnGhostExit プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnGhostExit.md)
pub fn build_on_ghost_exit_event_request(ghost_name: &str) -> String {
    let refs = vec![ghost_name.to_string()];
    build_shiori_request_extended("GET", "OnGhostExit", &refs, None)
}

/// OnMenuExec プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnMenuExec.md)
pub fn build_on_menu_exec_event_request(menu_name: &str) -> String {
    let refs = vec![menu_name.to_string()];
    build_shiori_request_extended("GET", "OnMenuExec", &refs, None)
}

/// OnHeadlinesenseBegin イベントリクエスト構築 (ukadoc-spec/list/shiori-event/headline-rss/OnHeadlinesenseBegin.md)
pub fn build_on_headlinesense_begin_request(headline_name: &str) -> String {
    let refs = vec![headline_name.to_string()];
    build_shiori_request_extended("GET", "OnHeadlinesenseBegin", &refs, None)
}

/// OnGhostInfoUpdate プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnGhostInfoUpdate.md)
pub fn build_on_ghost_info_update_request(ghost_name: &str) -> String {
    let refs = vec![ghost_name.to_string()];
    build_shiori_request_extended("GET", "OnGhostInfoUpdate", &refs, None)
}

/// OnOtherGhostTalk プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnOtherGhostTalk.md)
pub fn build_on_other_ghost_talk_request(talker: &str, listener: &str, script: &str) -> String {
    let refs = vec![talker.to_string(), listener.to_string(), script.to_string()];
    build_shiori_request_extended("GET", "OnOtherGhostTalk", &refs, None)
}

/// OnBalloonBreak イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonBreak.md)
pub fn build_on_balloon_break_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended("GET", "OnBalloonBreak", &refs, None)
}

/// OnBalloonClose イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonClose.md)
pub fn build_on_balloon_close_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended("GET", "OnBalloonClose", &refs, None)
}

/// OnBalloonTimeout イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonTimeout.md)
pub fn build_on_balloon_timeout_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended("GET", "OnBalloonTimeout", &refs, None)
}

/// OnGamepadConnected イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadConnected.md)
pub fn build_on_gamepad_connected_request(pad_index: i32) -> String {
    let refs = vec![pad_index.to_string()];
    build_shiori_request_extended("GET", "OnGamepadConnected", &refs, None)
}

/// OnGamepadDisconnected イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadDisconnected.md)
pub fn build_on_gamepad_disconnected_request(pad_index: i32) -> String {
    let refs = vec![pad_index.to_string()];
    build_shiori_request_extended("GET", "OnGamepadDisconnected", &refs, None)
}

/// OnGamepadButtonDown イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadButtonDown.md)
pub fn build_on_gamepad_button_down_request(pad_index: i32, button_id: i32) -> String {
    let refs = vec![pad_index.to_string(), button_id.to_string()];
    build_shiori_request_extended("GET", "OnGamepadButtonDown", &refs, None)
}

/// OnGamepadButtonUp イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadButtonUp.md)
pub fn build_on_gamepad_button_up_request(pad_index: i32, button_id: i32) -> String {
    let refs = vec![pad_index.to_string(), button_id.to_string()];
    build_shiori_request_extended("GET", "OnGamepadButtonUp", &refs, None)
}

/// OnGamepadAxisMove イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadAxisMove.md)
pub fn build_on_gamepad_axis_move_request(pad_index: i32, axis_id: i32, value: f64) -> String {
    let refs = vec![pad_index.to_string(), axis_id.to_string(), value.to_string()];
    build_shiori_request_extended("GET", "OnGamepadAxisMove", &refs, None)
}

/// OnTeach イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTeach.md)
pub fn build_on_teach_request(taught_str: &str) -> String {
    let refs = vec![taught_str.to_string()];
    build_shiori_request_extended("GET", "OnTeach", &refs, None)
}

/// OnCommunicate イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnCommunicate.md)
pub fn build_on_communicate_request(sender_name: &str, message: &str) -> String {
    let refs = vec![sender_name.to_string(), message.to_string()];
    build_shiori_request_extended("GET", "OnCommunicate", &refs, None)
}

/// OnUserInput イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
pub fn build_on_user_input_request(input_id: &str, input_value: &str) -> String {
    let refs = vec![input_id.to_string(), input_value.to_string()];
    build_shiori_request_extended("GET", "OnUserInput", &refs, None)
}

/// OnTextAreaInput イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInput.md)
pub fn build_on_text_area_input_request(input_id: &str, text_value: &str) -> String {
    let refs = vec![input_id.to_string(), text_value.to_string()];
    build_shiori_request_extended("GET", "OnTextAreaInput", &refs, None)
}

/// OnUserInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel.md)
pub fn build_on_user_input_cancel_request(input_id: &str) -> String {
    let refs = vec![input_id.to_string()];
    build_shiori_request_extended("GET", "OnUserInputCancel", &refs, None)
}

/// OnTeachInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel.md)
pub fn build_on_teach_input_cancel_request() -> String {
    build_shiori_request_extended("GET", "OnTeachInputCancel", &[], None)
}

/// OnCommunicateInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnCommunicateInputCancel.md)
pub fn build_on_communicate_input_cancel_request() -> String {
    build_shiori_request_extended("GET", "OnCommunicateInputCancel", &[], None)
}

/// OnTextAreaInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInputCancel.md)
pub fn build_on_text_area_input_cancel_request(input_id: &str) -> String {
    let refs = vec![input_id.to_string()];
    build_shiori_request_extended("GET", "OnTextAreaInputCancel", &refs, None)
}

/// OnInitialize イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnInitialize.md)
pub fn build_on_initialize_request() -> String {
    build_shiori_request_extended("GET", "OnInitialize", &[], None)
}

/// OnDestroy イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnDestroy.md)
pub fn build_on_destroy_request() -> String {
    build_shiori_request_extended("GET", "OnDestroy", &[], None)
}

/// OnSysSuspend イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnSysSuspend.md)
pub fn build_on_sys_suspend_request() -> String {
    build_shiori_request_extended("GET", "OnSysSuspend", &[], None)
}

/// OnSysResume イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnSysResume.md)
pub fn build_on_sys_resume_request() -> String {
    build_shiori_request_extended("GET", "OnSysResume", &[], None)
}

/// OnWindowStateMinimize イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateMinimize.md)
pub fn build_on_window_state_minimize_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended("GET", "OnWindowStateMinimize", &refs, None)
}

/// OnWindowStateRestore イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore.md)
pub fn build_on_window_state_restore_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended("GET", "OnWindowStateRestore", &refs, None)
}

/// OnSystemDialogCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/dialogbox/OnSystemDialogCancel.md)
pub fn build_on_system_dialog_cancel_request(dialog_type: &str) -> String {
    let refs = vec![dialog_type.to_string()];
    build_shiori_request_extended("GET", "OnSystemDialogCancel", &refs, None)
}

#[wasm_bindgen]
pub fn wasm_build_shiori_request(method: &str, headers_js: JsValue) -> Result<String, JsValue> {
    let headers: BTreeMap<String, String> = if headers_js.is_null() || headers_js.is_undefined() {
        BTreeMap::new()
    } else {
        serde_wasm_bindgen::from_value(headers_js)?
    };
    Ok(build_shiori_request(method, headers))
}

#[wasm_bindgen]
pub fn wasm_build_shiori_notify(event_name: &str, references_js: JsValue) -> Result<String, JsValue> {
    let references: Vec<String> = if references_js.is_null() || references_js.is_undefined() {
        vec![]
    } else {
        serde_wasm_bindgen::from_value(references_js)?
    };
    Ok(build_shiori_notify(event_name, &references))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_shiori_request() {
        let mut headers = BTreeMap::new();
        headers.insert("Charset".to_string(), "UTF-8".to_string());
        let req = build_shiori_request("GET", headers);
        assert!(req.contains("GET SHIORI/3.0"));
        assert!(req.contains("Charset: UTF-8"));
    }

    #[test]
    fn test_build_shiori_notify() {
        let refs = vec!["arg0".to_string(), "arg1".to_string()];
        let notify = build_shiori_notify("OnTestEvent", &refs);
        assert!(notify.contains("NOTIFY SHIORI/3.0"));
        assert!(notify.contains("ID: OnTestEvent"));
        assert!(notify.contains("Reference0: arg0"));
        assert!(notify.contains("Reference1: arg1"));
    }

    #[test]
    fn test_build_shiori_request_extended() {
        let params = ShioriExtendedParams {
            charset: Some("UTF-8".into()),
            sender: Some("SSP".into()),
            sender_type: Some("internal,raise".into()),
            security_level: Some("local".into()),
            status: Some("choosing,balloon(0=0)".into()),
            base_id: Some("OnBoot".into()),
        };
        let refs = vec!["1".into()];
        let req = build_shiori_request_extended("GET", "OnFirstBoot", &refs, Some(params));
        assert!(req.contains("GET SHIORI/3.0"));
        assert!(req.contains("Sender: SSP"));
        assert!(req.contains("SenderType: internal,raise"));
        assert!(req.contains("SecurityLevel: local"));
        assert!(req.contains("Status: choosing,balloon(0=0)"));
        assert!(req.contains("ID: OnFirstBoot"));
        assert!(req.contains("BaseID: OnBoot"));
        assert!(req.contains("Reference0: 1"));
    }

    #[test]
    fn test_official_shiori_event_builders() {
        let boot_req = build_on_boot_request(true, "Kero", "EmilyDir");
        assert!(boot_req.contains("ID: OnFirstBoot"));
        assert!(boot_req.contains("BaseID: OnBoot"));
        assert!(boot_req.contains("Reference0: 1"));

        let click_req = build_on_mouse_click_request(50, 60, 0, "head", 0);
        assert!(click_req.contains("ID: OnMouseClick"));
        assert!(click_req.contains("Reference4: head"));

        let choice_req = build_on_choice_select_request("choice_01");
        assert!(choice_req.contains("ID: OnChoiceSelect"));
        assert!(choice_req.contains("Reference0: choice_01"));

        let changing_req = build_on_ghost_changing_request("NextGhost");
        assert!(changing_req.contains("ID: OnGhostChanging"));
        assert!(changing_req.contains("Reference0: NextGhost"));

        let changed_req = build_on_ghost_changed_request("NextGhost");
        assert!(changed_req.contains("ID: OnGhostChanged"));
        assert!(changed_req.contains("Reference0: NextGhost"));

        let balloon_req = build_on_balloon_change_request("ModernBalloon");
        assert!(balloon_req.contains("ID: OnBalloonChange"));
        assert!(balloon_req.contains("Reference0: ModernBalloon"));

        let biff_req = build_on_biff_request();
        assert!(biff_req.contains("ID: OnBIFFBegin"));

        let drop_req = build_on_file_drop_request("/path/to/nar.nar");
        assert!(drop_req.contains("ID: OnFileDrop"));
        assert!(drop_req.contains("Reference0: /path/to/nar.nar"));

        let drop_ex_req = build_on_file_drop_ex_request("/path/to/nar.nar", 1);
        assert!(drop_ex_req.contains("ID: OnFileDropEx"));
        assert!(drop_ex_req.contains("Reference1: 1"));

        let nar_req = build_on_nar_creating_request("ghost.nar");
        assert!(nar_req.contains("ID: OnNarCreating"));

        let wall_req = build_on_wallpaper_change_request("wallpaper.png");
        assert!(wall_req.contains("ID: OnWallpaperChange"));

        let schedule_read = build_on_schedule_read_request("2026/10/24", "Meeting");
        assert!(schedule_read.contains("ID: OnScheduleRead"));
        assert!(schedule_read.contains("Reference0: 2026/10/24"));
        assert!(schedule_read.contains("Reference1: Meeting"));

        let schedule_today = build_on_schedule_today_notify_request("Deadline");
        assert!(schedule_today.contains("ID: OnScheduleTodayNotify"));
        assert!(schedule_today.contains("Reference0: Deadline"));

        let schedule_5min = build_on_schedule_5minutes_to_go_request("Dentist");
        assert!(schedule_5min.contains("ID: OnSchedule5MinutesToGo"));
        assert!(schedule_5min.contains("Reference0: Dentist"));

        let plugin_boot = build_on_ghost_boot_event_request("Emily");
        assert!(plugin_boot.contains("ID: OnGhostBoot"));
        assert!(plugin_boot.contains("Reference0: Emily"));

        let plugin_exit = build_on_ghost_exit_event_request("Emily");
        assert!(plugin_exit.contains("ID: OnGhostExit"));

        let menu_exec = build_on_menu_exec_event_request("Main Menu");
        assert!(menu_exec.contains("ID: OnMenuExec"));

        let headline_begin = build_on_headlinesense_begin_request("RSS Feed");
        assert!(headline_begin.contains("ID: OnHeadlinesenseBegin"));

        let info_update = build_on_ghost_info_update_request("Emily");
        assert!(info_update.contains("ID: OnGhostInfoUpdate"));
        assert!(info_update.contains("Reference0: Emily"));

        let other_talk = build_on_other_ghost_talk_request("Emily", "Sakura", "Hello");
        assert!(other_talk.contains("ID: OnOtherGhostTalk"));
        assert!(other_talk.contains("Reference0: Emily"));
        assert!(other_talk.contains("Reference1: Sakura"));
        assert!(other_talk.contains("Reference2: Hello"));

        let balloon_break = build_on_balloon_break_request(0);
        assert!(balloon_break.contains("ID: OnBalloonBreak"));
        assert!(balloon_break.contains("Reference0: 0"));

        let balloon_close = build_on_balloon_close_request(1);
        assert!(balloon_close.contains("ID: OnBalloonClose"));
        assert!(balloon_close.contains("Reference0: 1"));

        let balloon_timeout = build_on_balloon_timeout_request(0);
        assert!(balloon_timeout.contains("ID: OnBalloonTimeout"));

        let gp_conn = build_on_gamepad_connected_request(0);
        assert!(gp_conn.contains("ID: OnGamepadConnected"));
        assert!(gp_conn.contains("Reference0: 0"));

        let gp_disconn = build_on_gamepad_disconnected_request(0);
        assert!(gp_disconn.contains("ID: OnGamepadDisconnected"));

        let gp_btn_down = build_on_gamepad_button_down_request(0, 1);
        assert!(gp_btn_down.contains("ID: OnGamepadButtonDown"));
        assert!(gp_btn_down.contains("Reference1: 1"));

        let gp_btn_up = build_on_gamepad_button_up_request(0, 1);
        assert!(gp_btn_up.contains("ID: OnGamepadButtonUp"));

        let gp_axis = build_on_gamepad_axis_move_request(0, 2, 0.75);
        assert!(gp_axis.contains("ID: OnGamepadAxisMove"));
        assert!(gp_axis.contains("Reference2: 0.75"));

        let teach_req = build_on_teach_request("apple is a fruit");
        assert!(teach_req.contains("ID: OnTeach"));
        assert!(teach_req.contains("Reference0: apple is a fruit"));

        let comm_req = build_on_communicate_request("Sakura", "Hi Emily");
        assert!(comm_req.contains("ID: OnCommunicate"));
        assert!(comm_req.contains("Reference0: Sakura"));
        assert!(comm_req.contains("Reference1: Hi Emily"));

        let input_req = build_on_user_input_request("input_name", "Nanai");
        assert!(input_req.contains("ID: OnUserInput"));
        assert!(input_req.contains("Reference0: input_name"));
        assert!(input_req.contains("Reference1: Nanai"));

        let textarea_req = build_on_text_area_input_request("memo_area", "Hello world");
        assert!(textarea_req.contains("ID: OnTextAreaInput"));
        assert!(textarea_req.contains("Reference0: memo_area"));
        assert!(textarea_req.contains("Reference1: Hello world"));

        let input_cancel = build_on_user_input_cancel_request("input_name");
        assert!(input_cancel.contains("ID: OnUserInputCancel"));
        assert!(input_cancel.contains("Reference0: input_name"));

        let teach_cancel = build_on_teach_input_cancel_request();
        assert!(teach_cancel.contains("ID: OnTeachInputCancel"));

        let comm_cancel = build_on_communicate_input_cancel_request();
        assert!(comm_cancel.contains("ID: OnCommunicateInputCancel"));

        let textarea_cancel = build_on_text_area_input_cancel_request("memo_area");
        assert!(textarea_cancel.contains("ID: OnTextAreaInputCancel"));
        assert!(textarea_cancel.contains("Reference0: memo_area"));

        let init_req = build_on_initialize_request();
        assert!(init_req.contains("ID: OnInitialize"));

        let destroy_req = build_on_destroy_request();
        assert!(destroy_req.contains("ID: OnDestroy"));

        let sys_suspend = build_on_sys_suspend_request();
        assert!(sys_suspend.contains("ID: OnSysSuspend"));

        let sys_resume = build_on_sys_resume_request();
        assert!(sys_resume.contains("ID: OnSysResume"));

        let win_min = build_on_window_state_minimize_request(0);
        assert!(win_min.contains("ID: OnWindowStateMinimize"));
        assert!(win_min.contains("Reference0: 0"));

        let win_restore = build_on_window_state_restore_request(1);
        assert!(win_restore.contains("ID: OnWindowStateRestore"));

        let sys_dlg_cancel = build_on_system_dialog_cancel_request("file");
        assert!(sys_dlg_cancel.contains("ID: OnSystemDialogCancel"));
        assert!(sys_dlg_cancel.contains("Reference0: file"));
    }
}

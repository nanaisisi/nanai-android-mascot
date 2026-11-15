//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (ファイルドロップ・バルーン・スケジュール・ゲームパッド・OS状態等)

use crate::shiori_protocol_helpers::build_shiori_request_extended;

/// OnBalloonChange イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonChange.md)
pub fn build_on_balloon_change_request(balloon_name: &str) -> String {
    let refs = vec![balloon_name.to_string()];
    build_shiori_request_extended("GET", "OnBalloonChange", &refs, None)
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
    let refs = vec![
        pad_index.to_string(),
        axis_id.to_string(),
        value.to_string(),
    ];
    build_shiori_request_extended("GET", "OnGamepadAxisMove", &refs, None)
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

/// OnBatteryNotify イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnBatteryNotify.md)
pub fn build_on_battery_notify_request(level: u8, ac_online: bool) -> String {
    let refs = vec![
        level.to_string(),
        if ac_online {
            "1".to_string()
        } else {
            "0".to_string()
        },
    ];
    build_shiori_request_extended("GET", "OnBatteryNotify", &refs, None)
}

/// OnDisplayChange イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnDisplayChange.md)
pub fn build_on_display_change_request(width: i32, height: i32, bpp: i32) -> String {
    let refs = vec![width.to_string(), height.to_string(), bpp.to_string()];
    build_shiori_request_extended("GET", "OnDisplayChange", &refs, None)
}

/// OnDarkTheme イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnDarkTheme.md)
pub fn build_on_dark_theme_request(enabled: bool) -> String {
    let refs = vec![if enabled {
        "1".to_string()
    } else {
        "0".to_string()
    }];
    build_shiori_request_extended("GET", "OnDarkTheme", &refs, None)
}

/// OnRecycleBinStatusUpdate イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnRecycleBinStatusUpdate.md)
pub fn build_on_recycle_bin_status_update_request(count: u32, bytes: u64) -> String {
    let refs = vec![count.to_string(), bytes.to_string()];
    build_shiori_request_extended("GET", "OnRecycleBinStatusUpdate", &refs, None)
}

/// OnScreenSaverStart イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnScreenSaverStart.md)
pub fn build_on_screen_saver_start_request() -> String {
    build_shiori_request_extended("GET", "OnScreenSaverStart", &[], None)
}

/// OnScreenSaverEnd イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnScreenSaverEnd.md)
pub fn build_on_screen_saver_end_request() -> String {
    build_shiori_request_extended("GET", "OnScreenSaverEnd", &[], None)
}

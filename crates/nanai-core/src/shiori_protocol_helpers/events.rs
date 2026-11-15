//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群

use crate::shiori_protocol_core::ShioriExtendedParams;
use super::build_shiori_request_extended;

/// OnBoot / OnFirstBoot イベントリクエスト構築
pub fn build_on_boot_request(is_first_boot: bool, kero_name: &str, ghost_dir: &str) -> String {
    let event_id = if is_first_boot {
        "OnFirstBoot"
    } else {
        "OnBoot"
    };
    let base_id = if is_first_boot {
        Some("OnBoot".to_string())
    } else {
        None
    };
    let refs = vec![
        if is_first_boot {
            "1".to_string()
        } else {
            "0".to_string()
        },
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

/// OnMouseClickEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseClickEx.md)
pub fn build_on_mouse_click_ex_request(
    x: i32,
    y: i32,
    scope_id: i32,
    collision_name: &str,
    button: i32,
    key_state: i32,
) -> String {
    let refs = vec![
        x.to_string(),
        y.to_string(),
        "0".to_string(),
        scope_id.to_string(),
        collision_name.to_string(),
        button.to_string(),
        key_state.to_string(),
    ];
    build_shiori_request_extended("GET", "OnMouseClickEx", &refs, None)
}

/// OnChoiceSelect イベントリクエスト構築
pub fn build_on_choice_select_request(choice_id: &str) -> String {
    let refs = vec![choice_id.to_string()];
    build_shiori_request_extended("GET", "OnChoiceSelect", &refs, None)
}

/// OnChoiceSelectEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceSelectEx.md)
pub fn build_on_choice_select_ex_request(choice_id: &str, text: &str, extra_data: &str) -> String {
    let refs = vec![
        choice_id.to_string(),
        text.to_string(),
        extra_data.to_string(),
    ];
    build_shiori_request_extended("GET", "OnChoiceSelectEx", &refs, None)
}

/// OnChoiceTimeout イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceTimeout.md)
pub fn build_on_choice_timeout_request() -> String {
    build_shiori_request_extended("GET", "OnChoiceTimeout", &[], None)
}

/// OnAnchorSelectEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorSelectEx.md)
pub fn build_on_anchor_select_ex_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnAnchorSelectEx", &refs, None)
}

/// OnChoiceEnter イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceEnter.md)
pub fn build_on_choice_enter_request(choice_id: &str, text: &str) -> String {
    let refs = vec![choice_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnChoiceEnter", &refs, None)
}

/// OnChoiceHover イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceHover.md)
pub fn build_on_choice_hover_request(choice_id: &str, text: &str) -> String {
    let refs = vec![choice_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnChoiceHover", &refs, None)
}

/// OnAnchorEnter イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorEnter.md)
pub fn build_on_anchor_enter_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnAnchorEnter", &refs, None)
}

/// OnAnchorHover イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorHover.md)
pub fn build_on_anchor_hover_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnAnchorHover", &refs, None)
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
        if enabled {
            "1".to_string()
        } else {
            "0".to_string()
        },
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

/// OnBIFFComplete イベントリクエスト構築 (ukadoc-spec/list/shiori-event/biff/OnBIFFComplete.md)
pub fn build_on_biff_complete_request(mail_count: usize, total_size: u64) -> String {
    let refs = vec![mail_count.to_string(), total_size.to_string()];
    build_shiori_request_extended("GET", "OnBIFFComplete", &refs, None)
}

/// OnBIFFFailure イベントリクエスト構築 (ukadoc-spec/list/shiori-event/biff/OnBIFFFailure.md)
pub fn build_on_biff_failure_request(reason: &str) -> String {
    let refs = vec![reason.to_string()];
    build_shiori_request_extended("GET", "OnBIFFFailure", &refs, None)
}

/// OnBIFF2Complete イベントリクエスト構築 (ukadoc-spec/list/shiori-event/biff/OnBIFF2Complete.md)
pub fn build_on_biff2_complete_request(mail_count: usize, unread_count: usize) -> String {
    let refs = vec![mail_count.to_string(), unread_count.to_string()];
    build_shiori_request_extended("GET", "OnBIFF2Complete", &refs, None)
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
    let refs = vec![
        pad_index.to_string(),
        axis_id.to_string(),
        value.to_string(),
    ];
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

/// OnMouseGesture イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseGesture.md)
pub fn build_on_mouse_gesture_request(gesture: &str, scope_id: i32) -> String {
    let refs = vec![gesture.to_string(), scope_id.to_string()];
    build_shiori_request_extended("GET", "OnMouseGesture", &refs, None)
}

/// OnMouseWheel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseWheel.md)
pub fn build_on_mouse_wheel_request(
    x: i32,
    y: i32,
    wheel_delta: i32,
    collision: &str,
    scope_id: i32,
) -> String {
    let refs = vec![
        x.to_string(),
        y.to_string(),
        wheel_delta.to_string(),
        collision.to_string(),
        scope_id.to_string(),
    ];
    build_shiori_request_extended("GET", "OnMouseWheel", &refs, None)
}

/// OnMouseDragStart イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseDragStart.md)
pub fn build_on_mouse_drag_start_request(x: i32, y: i32, scope_id: i32) -> String {
    let refs = vec![x.to_string(), y.to_string(), scope_id.to_string()];
    build_shiori_request_extended("GET", "OnMouseDragStart", &refs, None)
}

/// OnMouseDragEnd イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseDragEnd.md)
pub fn build_on_mouse_drag_end_request(x: i32, y: i32, scope_id: i32) -> String {
    let refs = vec![x.to_string(), y.to_string(), scope_id.to_string()];
    build_shiori_request_extended("GET", "OnMouseDragEnd", &refs, None)
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

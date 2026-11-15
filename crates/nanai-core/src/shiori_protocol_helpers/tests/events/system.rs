use crate::shiori_protocol_helpers::*;

#[test]
fn test_system_and_hardware_events() {
    let balloon_req = build_on_balloon_change_request("ModernBalloon");
    assert!(balloon_req.contains("ID: OnBalloonChange"));

    let schedule_read = build_on_schedule_read_request("2026/10/24", "Meeting");
    assert!(schedule_read.contains("ID: OnScheduleRead"));

    let schedule_today = build_on_schedule_today_notify_request("Deadline");
    assert!(schedule_today.contains("ID: OnScheduleTodayNotify"));

    let schedule_5min = build_on_schedule_5minutes_to_go_request("Dentist");
    assert!(schedule_5min.contains("ID: OnSchedule5MinutesToGo"));

    let menu_exec = build_on_menu_exec_event_request("Main Menu");
    assert!(menu_exec.contains("ID: OnMenuExec"));

    let other_talk = build_on_other_ghost_talk_request(Build_on_other_ghost_talk_requestParams {
        talker: "Emily",
        listener: "Sakura",
        script: "Hello",
    });
    assert!(other_talk.contains("ID: OnOtherGhostTalk"));

    let balloon_break = build_on_balloon_break_request(0);
    assert!(balloon_break.contains("ID: OnBalloonBreak"));

    let balloon_close = build_on_balloon_close_request(1);
    assert!(balloon_close.contains("ID: OnBalloonClose"));

    let balloon_timeout = build_on_balloon_timeout_request(0);
    assert!(balloon_timeout.contains("ID: OnBalloonTimeout"));

    let gp_conn = build_on_gamepad_connected_request(0);
    assert!(gp_conn.contains("ID: OnGamepadConnected"));

    let gp_disconn = build_on_gamepad_disconnected_request(0);
    assert!(gp_disconn.contains("ID: OnGamepadDisconnected"));

    let gp_btn_down = build_on_gamepad_button_down_request(0, 1);
    assert!(gp_btn_down.contains("ID: OnGamepadButtonDown"));

    let gp_btn_up = build_on_gamepad_button_up_request(0, 1);
    assert!(gp_btn_up.contains("ID: OnGamepadButtonUp"));

    let gp_axis = build_on_gamepad_axis_move_request(Build_on_gamepad_axis_move_requestParams {
        pad_index: 0,
        axis_id: 2,
        value: 0.75,
    });
    assert!(gp_axis.contains("ID: OnGamepadAxisMove"));

    let win_min = build_on_window_state_minimize_request(0);
    assert!(win_min.contains("ID: OnWindowStateMinimize"));

    let win_restore = build_on_window_state_restore_request(1);
    assert!(win_restore.contains("ID: OnWindowStateRestore"));

    let sys_dlg_cancel = build_on_system_dialog_cancel_request("file");
    assert!(sys_dlg_cancel.contains("ID: OnSystemDialogCancel"));

    let battery_req = build_on_battery_notify_request(85, true);
    assert!(battery_req.contains("ID: OnBatteryNotify"));

    let disp_req = build_on_display_change_request(Build_on_display_change_requestParams {
        width: 1920,
        height: 1080,
        bpp: 32,
    });
    assert!(disp_req.contains("ID: OnDisplayChange"));

    let dark_req = build_on_dark_theme_request(true);
    assert!(dark_req.contains("ID: OnDarkTheme"));

    let recycle_req = build_on_recycle_bin_status_update_request(12, 1048576);
    assert!(recycle_req.contains("ID: OnRecycleBinStatusUpdate"));

    let saver_start = build_on_screen_saver_start_request();
    assert!(saver_start.contains("ID: OnScreenSaverStart"));

    let saver_end = build_on_screen_saver_end_request();
    assert!(saver_end.contains("ID: OnScreenSaverEnd"));
}

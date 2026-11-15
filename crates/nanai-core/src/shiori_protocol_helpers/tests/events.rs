use crate::shiori_protocol_helpers::*;

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

    let choice_timeout = build_on_choice_timeout_request();
    assert!(choice_timeout.contains("ID: OnChoiceTimeout"));

    let anchor_ex = build_on_anchor_select_ex_request("anchor_1", "Text");
    assert!(anchor_ex.contains("ID: OnAnchorSelectEx"));
    assert!(anchor_ex.contains("Reference0: anchor_1"));
    assert!(anchor_ex.contains("Reference1: Text"));

    let choice_enter = build_on_choice_enter_request("c1", "Choice 1");
    assert!(choice_enter.contains("ID: OnChoiceEnter"));

    let choice_hover = build_on_choice_hover_request("c1", "Choice 1");
    assert!(choice_hover.contains("ID: OnChoiceHover"));

    let anchor_enter = build_on_anchor_enter_request("a1", "Anchor 1");
    assert!(anchor_enter.contains("ID: OnAnchorEnter"));

    let anchor_hover = build_on_anchor_hover_request("a1", "Anchor 1");
    assert!(anchor_hover.contains("ID: OnAnchorHover"));

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

    let biff_comp = build_on_biff_complete_request(5, 10240);
    assert!(biff_comp.contains("ID: OnBIFFComplete"));
    assert!(biff_comp.contains("Reference0: 5"));
    assert!(biff_comp.contains("Reference1: 10240"));

    let biff_fail = build_on_biff_failure_request("timeout");
    assert!(biff_fail.contains("ID: OnBIFFFailure"));
    assert!(biff_fail.contains("Reference0: timeout"));

    let biff2_comp = build_on_biff2_complete_request(10, 2);
    assert!(biff2_comp.contains("ID: OnBIFF2Complete"));
    assert!(biff2_comp.contains("Reference0: 10"));
    assert!(biff2_comp.contains("Reference1: 2"));

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

    let gesture_req = build_on_mouse_gesture_request("circle_cw", 0);
    assert!(gesture_req.contains("ID: OnMouseGesture"));
    assert!(gesture_req.contains("Reference0: circle_cw"));

    let wheel_req = build_on_mouse_wheel_request(100, 100, 120, "head", 0);
    assert!(wheel_req.contains("ID: OnMouseWheel"));
    assert!(wheel_req.contains("Reference2: 120"));
    assert!(wheel_req.contains("Reference3: head"));

    let drag_start = build_on_mouse_drag_start_request(10, 20, 0);
    assert!(drag_start.contains("ID: OnMouseDragStart"));

    let drag_end = build_on_mouse_drag_end_request(50, 50, 0);
    assert!(drag_end.contains("ID: OnMouseDragEnd"));

    let battery_req = build_on_battery_notify_request(85, true);
    assert!(battery_req.contains("ID: OnBatteryNotify"));
    assert!(battery_req.contains("Reference0: 85"));
    assert!(battery_req.contains("Reference1: 1"));

    let disp_req = build_on_display_change_request(1920, 1080, 32);
    assert!(disp_req.contains("ID: OnDisplayChange"));
    assert!(disp_req.contains("Reference0: 1920"));
    assert!(disp_req.contains("Reference1: 1080"));

    let dark_req = build_on_dark_theme_request(true);
    assert!(dark_req.contains("ID: OnDarkTheme"));
    assert!(dark_req.contains("Reference0: 1"));

    let recycle_req = build_on_recycle_bin_status_update_request(12, 1048576);
    assert!(recycle_req.contains("ID: OnRecycleBinStatusUpdate"));
    assert!(recycle_req.contains("Reference0: 12"));

    let saver_start = build_on_screen_saver_start_request();
    assert!(saver_start.contains("ID: OnScreenSaverStart"));

    let saver_end = build_on_screen_saver_end_request();
    assert!(saver_end.contains("ID: OnScreenSaverEnd"));

    let mouse_ex = build_on_mouse_click_ex_request(10, 20, 0, "head", 0, 1);
    assert!(mouse_ex.contains("ID: OnMouseClickEx"));
    assert!(mouse_ex.contains("Reference5: 0"));
    assert!(mouse_ex.contains("Reference6: 1"));

    let choice_ex = build_on_choice_select_ex_request("opt1", "Choice Text", "extra");
    assert!(choice_ex.contains("ID: OnChoiceSelectEx"));
    assert!(choice_ex.contains("Reference1: Choice Text"));
    assert!(choice_ex.contains("Reference2: extra"));
}

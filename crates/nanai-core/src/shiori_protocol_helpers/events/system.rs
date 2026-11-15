//! UKADOC公式仕様に準拠した標準SHIORIシステムイベントビルダーモジュール

use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

// --- balloon_plugin ---

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

/// OnOtherGhostTalk プラグインイベントリクエスト構築
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

/// OnBalloonBreak イベントリクエスト構築
pub fn build_on_balloon_break_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBalloonBreak",
        references: &refs,
        params: None,
    })
}

/// OnBalloonClose イベントリクエスト構築
pub fn build_on_balloon_close_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBalloonClose",
        references: &refs,
        params: None,
    })
}

/// OnBalloonTimeout イベントリクエスト構築
pub fn build_on_balloon_timeout_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBalloonTimeout",
        references: &refs,
        params: None,
    })
}

// --- calendar ---

/// OnScheduleRead イベントリクエスト構築
pub fn build_on_schedule_read_request(date_str: &str, title: &str) -> String {
    let refs = vec![date_str.to_string(), title.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnScheduleRead",
        references: &refs,
        params: None,
    })
}

/// OnScheduleTodayNotify イベントリクエスト構築
pub fn build_on_schedule_today_notify_request(title: &str) -> String {
    let refs = vec![title.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnScheduleTodayNotify",
        references: &refs,
        params: None,
    })
}

/// OnSchedule5MinutesToGo イベントリクエスト構築
pub fn build_on_schedule_5minutes_to_go_request(title: &str) -> String {
    let refs = vec![title.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnSchedule5MinutesToGo",
        references: &refs,
        params: None,
    })
}

// --- file_drop ---

/// OnBalloonChange イベントリクエスト構築
pub fn build_on_balloon_change_request(balloon_name: &str) -> String {
    let refs = vec![balloon_name.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBalloonChange",
        references: &refs,
        params: None,
    })
}

/// OnFileDrop イベントリクエスト構築
pub fn build_on_file_drop_request(file_path: &str) -> String {
    let refs = vec![file_path.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnFileDrop",
        references: &refs,
        params: None,
    })
}

/// OnFileDropEx イベントリクエスト構築
pub fn build_on_file_drop_ex_request(file_path: &str, scope_id: i32) -> String {
    let refs = vec![file_path.to_string(), scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnFileDropEx",
        references: &refs,
        params: None,
    })
}

/// OnNarCreating イベントリクエスト構築
pub fn build_on_nar_creating_request(nar_path: &str) -> String {
    let refs = vec![nar_path.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnNarCreating",
        references: &refs,
        params: None,
    })
}

/// OnWallpaperChange イベントリクエスト構築
pub fn build_on_wallpaper_change_request(wallpaper_path: &str) -> String {
    let refs = vec![wallpaper_path.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnWallpaperChange",
        references: &refs,
        params: None,
    })
}

// --- gamepad ---

/// OnGamepadConnected イベントリクエスト構築
pub fn build_on_gamepad_connected_request(pad_index: i32) -> String {
    let refs = vec![pad_index.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadConnected",
        references: &refs,
        params: None,
    })
}

/// OnGamepadDisconnected イベントリクエスト構築
pub fn build_on_gamepad_disconnected_request(pad_index: i32) -> String {
    let refs = vec![pad_index.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadDisconnected",
        references: &refs,
        params: None,
    })
}

/// OnGamepadButtonDown イベントリクエスト構築
pub fn build_on_gamepad_button_down_request(pad_index: i32, button_id: i32) -> String {
    let refs = vec![pad_index.to_string(), button_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadButtonDown",
        references: &refs,
        params: None,
    })
}

/// OnGamepadButtonUp イベントリクエスト構築
pub fn build_on_gamepad_button_up_request(pad_index: i32, button_id: i32) -> String {
    let refs = vec![pad_index.to_string(), button_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadButtonUp",
        references: &refs,
        params: None,
    })
}

#[allow(non_camel_case_types)]
pub struct Build_on_gamepad_axis_move_requestParams {
    pub(crate) pad_index: i32,
    pub(crate) axis_id: i32,
    pub(crate) value: f64,
}

#[allow(dead_code)]
impl Build_on_gamepad_axis_move_requestParams {
    pub fn pad_index(&self) -> i32 {
        self.pad_index
    }
    pub fn axis_id(&self) -> i32 {
        self.axis_id
    }
    pub fn value(&self) -> f64 {
        self.value
    }
}

/// OnGamepadAxisMove イベントリクエスト構築
pub fn build_on_gamepad_axis_move_request(
    params: Build_on_gamepad_axis_move_requestParams,
) -> String {
    let pad_index = params.pad_index();
    let axis_id = params.axis_id();
    let value = params.value();
    let refs = vec![
        pad_index.to_string(),
        axis_id.to_string(),
        value.to_string(),
    ];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadAxisMove",
        references: &refs,
        params: None,
    })
}

// --- os_window ---

/// OnWindowStateMinimize イベントリクエスト構築
pub fn build_on_window_state_minimize_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnWindowStateMinimize",
        references: &refs,
        params: None,
    })
}

/// OnWindowStateRestore イベントリクエスト構築
pub fn build_on_window_state_restore_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnWindowStateRestore",
        references: &refs,
        params: None,
    })
}

/// OnSystemDialogCancel イベントリクエスト構築
pub fn build_on_system_dialog_cancel_request(dialog_type: &str) -> String {
    let refs = vec![dialog_type.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnSystemDialogCancel",
        references: &refs,
        params: None,
    })
}

/// OnBatteryNotify イベントリクエスト構築
pub fn build_on_battery_notify_request(level: u8, ac_online: bool) -> String {
    let refs = vec![
        level.to_string(),
        if ac_online {
            "1".to_string()
        } else {
            "0".to_string()
        },
    ];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBatteryNotify",
        references: &refs,
        params: None,
    })
}

#[allow(non_camel_case_types)]
pub struct Build_on_display_change_requestParams {
    pub(crate) width: i32,
    pub(crate) height: i32,
    pub(crate) bpp: i32,
}

#[allow(dead_code)]
impl Build_on_display_change_requestParams {
    pub fn width(&self) -> i32 {
        self.width
    }
    pub fn height(&self) -> i32 {
        self.height
    }
    pub fn bpp(&self) -> i32 {
        self.bpp
    }
}

/// OnDisplayChange イベントリクエスト構築
pub fn build_on_display_change_request(params: Build_on_display_change_requestParams) -> String {
    let width = params.width();
    let height = params.height();
    let bpp = params.bpp();
    let refs = vec![width.to_string(), height.to_string(), bpp.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnDisplayChange",
        references: &refs,
        params: None,
    })
}

/// OnDarkTheme イベントリクエスト構築
pub fn build_on_dark_theme_request(enabled: bool) -> String {
    let refs = vec![if enabled {
        "1".to_string()
    } else {
        "0".to_string()
    }];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnDarkTheme",
        references: &refs,
        params: None,
    })
}

/// OnRecycleBinStatusUpdate イベントリクエスト構築
pub fn build_on_recycle_bin_status_update_request(count: u32, bytes: u64) -> String {
    let refs = vec![count.to_string(), bytes.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnRecycleBinStatusUpdate",
        references: &refs,
        params: None,
    })
}

/// OnScreenSaverStart イベントリクエスト構築
pub fn build_on_screen_saver_start_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnScreenSaverStart",
        references: &[],
        params: None,
    })
}

/// OnScreenSaverEnd イベントリクエスト構築
pub fn build_on_screen_saver_end_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnScreenSaverEnd",
        references: &[],
        params: None,
    })
}

//! ウィンドウ最小化・ダイアログキャンセル・バッテリー・ディスプレイ・テーマ等 OS 状態通知イベントビルダー

use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

/// OnWindowStateMinimize イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateMinimize.md)
pub fn build_on_window_state_minimize_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnWindowStateMinimize",
        references: &refs,
        params: None,
    })
}

/// OnWindowStateRestore イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore.md)
pub fn build_on_window_state_restore_request(scope_id: i32) -> String {
    let refs = vec![scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnWindowStateRestore",
        references: &refs,
        params: None,
    })
}

/// OnSystemDialogCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/dialogbox/OnSystemDialogCancel.md)
pub fn build_on_system_dialog_cancel_request(dialog_type: &str) -> String {
    let refs = vec![dialog_type.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnSystemDialogCancel",
        references: &refs,
        params: None,
    })
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
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBatteryNotify",
        references: &refs,
        params: None,
    })
}

/// OnDisplayChange イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnDisplayChange.md)
pub fn build_on_display_change_request(width: i32, height: i32, bpp: i32) -> String {
    let refs = vec![width.to_string(), height.to_string(), bpp.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnDisplayChange",
        references: &refs,
        params: None,
    })
}

/// OnDarkTheme イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnDarkTheme.md)
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

/// OnRecycleBinStatusUpdate イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnRecycleBinStatusUpdate.md)
pub fn build_on_recycle_bin_status_update_request(count: u32, bytes: u64) -> String {
    let refs = vec![count.to_string(), bytes.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnRecycleBinStatusUpdate",
        references: &refs,
        params: None,
    })
}

/// OnScreenSaverStart イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnScreenSaverStart.md)
pub fn build_on_screen_saver_start_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnScreenSaverStart",
        references: &[],
        params: None,
    })
}

/// OnScreenSaverEnd イベントリクエスト構築 (ukadoc-spec/list/shiori-event/os-state/OnScreenSaverEnd.md)
pub fn build_on_screen_saver_end_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnScreenSaverEnd",
        references: &[],
        params: None,
    })
}

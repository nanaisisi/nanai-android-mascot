//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (ライフサイクル・起動・終了・ゴースト切替等)

use crate::shiori_protocol_core::ShioriExtendedParams;
use crate::shiori_protocol_helpers::build_shiori_request_extended;

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

/// OnGhostInfoUpdate プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnGhostInfoUpdate.md)
pub fn build_on_ghost_info_update_request(ghost_name: &str) -> String {
    let refs = vec![ghost_name.to_string()];
    build_shiori_request_extended("GET", "OnGhostInfoUpdate", &refs, None)
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

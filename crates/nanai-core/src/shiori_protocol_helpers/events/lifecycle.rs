//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (ライフサイクル・起動・終了・ゴースト切替等)

use crate::shiori_protocol_core::ShioriExtendedParams;
use crate::shiori_protocol_helpers::{build_shiori_request_extended, Build_shiori_request_extendedParams};

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
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id,
        references: &refs,
        params: Some(params),
    })
}

/// OnClose イベントリクエスト構築
pub fn build_on_close_request(reason: u32) -> String {
    let refs = vec![reason.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnClose",
        references: &refs,
        params: None,
    })
}

/// OnShellChanged イベントリクエスト構築
pub fn build_on_shell_changed_request(shell_name: &str) -> String {
    let refs = vec![shell_name.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnShellChanged",
        references: &refs,
        params: None,
    })
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
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnDressupChanged",
        references: &refs,
        params: None,
    })
}

/// OnGhostChanging イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnGhostChanging.md)
pub fn build_on_ghost_changing_request(target_ghost: &str) -> String {
    let refs = vec![target_ghost.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGhostChanging",
        references: &refs,
        params: None,
    })
}

/// OnGhostChanged イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnGhostChanged.md)
pub fn build_on_ghost_changed_request(target_ghost: &str) -> String {
    let refs = vec![target_ghost.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGhostChanged",
        references: &refs,
        params: None,
    })
}

/// OnGhostBoot プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnGhostBoot.md)
pub fn build_on_ghost_boot_event_request(ghost_name: &str) -> String {
    let refs = vec![ghost_name.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGhostBoot",
        references: &refs,
        params: None,
    })
}

/// OnGhostExit プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnGhostExit.md)
pub fn build_on_ghost_exit_event_request(ghost_name: &str) -> String {
    let refs = vec![ghost_name.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGhostExit",
        references: &refs,
        params: None,
    })
}

/// OnGhostInfoUpdate プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnGhostInfoUpdate.md)
pub fn build_on_ghost_info_update_request(ghost_name: &str) -> String {
    let refs = vec![ghost_name.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGhostInfoUpdate",
        references: &refs,
        params: None,
    })
}

/// OnInitialize イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnInitialize.md)
pub fn build_on_initialize_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnInitialize",
        references: &[],
        params: None,
    })
}

/// OnDestroy イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnDestroy.md)
pub fn build_on_destroy_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnDestroy",
        references: &[],
        params: None,
    })
}

/// OnSysSuspend イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnSysSuspend.md)
pub fn build_on_sys_suspend_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnSysSuspend",
        references: &[],
        params: None,
    })
}

/// OnSysResume イベントリクエスト構築 (ukadoc-spec/list/shiori-event/boot-close-change/OnSysResume.md)
pub fn build_on_sys_resume_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnSysResume",
        references: &[],
        params: None,
    })
}

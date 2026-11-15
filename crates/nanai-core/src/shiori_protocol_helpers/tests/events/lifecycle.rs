use crate::shiori_protocol_helpers::*;

#[test]
fn test_lifecycle_and_boot_events() {
    let boot_req = build_on_boot_request(Build_on_boot_requestParams {
        is_first_boot: true,
        kero_name: "Kero",
        ghost_dir: "EmilyDir",
    });
    assert!(boot_req.contains("ID: OnFirstBoot"));
    assert!(boot_req.contains("BaseID: OnBoot"));
    assert!(boot_req.contains("Reference0: 1"));

    let changing_req = build_on_ghost_changing_request("NextGhost");
    assert!(changing_req.contains("ID: OnGhostChanging"));
    assert!(changing_req.contains("Reference0: NextGhost"));

    let changed_req = build_on_ghost_changed_request("NextGhost");
    assert!(changed_req.contains("ID: OnGhostChanged"));
    assert!(changed_req.contains("Reference0: NextGhost"));

    let init_req = build_on_initialize_request();
    assert!(init_req.contains("ID: OnInitialize"));

    let destroy_req = build_on_destroy_request();
    assert!(destroy_req.contains("ID: OnDestroy"));

    let sys_suspend = build_on_sys_suspend_request();
    assert!(sys_suspend.contains("ID: OnSysSuspend"));

    let sys_resume = build_on_sys_resume_request();
    assert!(sys_resume.contains("ID: OnSysResume"));

    let plugin_boot = build_on_ghost_boot_event_request("Emily");
    assert!(plugin_boot.contains("ID: OnGhostBoot"));
    assert!(plugin_boot.contains("Reference0: Emily"));

    let plugin_exit = build_on_ghost_exit_event_request("Emily");
    assert!(plugin_exit.contains("ID: OnGhostExit"));

    let info_update = build_on_ghost_info_update_request("Emily");
    assert!(info_update.contains("ID: OnGhostInfoUpdate"));
    assert!(info_update.contains("Reference0: Emily"));
}

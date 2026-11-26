use super::*;

#[test]
fn test_network_update_event_builders() {
    let begin_req = build_on_update_begin_request(Some("ghost"), Some("manual"));
    assert!(begin_req.contains("ID: OnUpdateBegin"));
    assert!(begin_req.contains("Reference3: ghost"));
    assert!(begin_req.contains("Reference4: manual"));

    let ready_req = build_on_update_ready_request(Build_on_update_ready_requestParams {
        file_count: 3,
        update_target: Some("shell"),
        update_mode: Some("auto"),
    });
    assert!(ready_req.contains("ID: OnUpdateReady"));
    assert!(ready_req.contains("Reference0: 3"));

    let comp_req = build_on_update_complete_request(Build_on_update_complete_requestParams {
        result: Some("changed"),
        updated_files_count: 2,
        update_target: Some("ghost"),
        update_mode: Some("manual"),
    });
    assert!(comp_req.contains("ID: OnUpdateComplete"));
    assert!(comp_req.contains("Reference0: changed"));
    assert!(comp_req.contains("Reference1: 2"));

    let fail_req = build_on_update_failure_request(Build_on_update_failure_requestParams {
        err: "404 Not Found",
        file_name: Some("surfaces.png"),
        update_target: Some("ghost"),
        update_mode: Some("manual"),
    });
    assert!(fail_req.contains("ID: OnUpdateFailure"));
    assert!(fail_req.contains("Reference0: 404"));
    assert!(fail_req.contains("Reference1: surfaces.png"));
}

#[test]
fn test_parse_delete_and_developer_options() {
    let delete_content = "# comment\ntemp/*.tmp\nold_file.dat\n";
    let del_manifest = parse_delete_txt(delete_content);
    assert_eq!(
        del_manifest.patterns(),
        &["temp/*.tmp".to_string(), "old_file.dat".to_string()]
    );

    let dev_content = "noupdate: assets/private\ndebug=true\n";
    let dev_manifest = parse_developer_options_txt(dev_content);
    assert_eq!(
        dev_manifest.noupdate_patterns(),
        &["assets/private".to_string()]
    );
    assert_eq!(
        dev_manifest.properties().get("debug"),
        Some(&"true".to_string())
    );
}

#[test]
fn test_normalize_update_reason() {
    assert_eq!(normalize_update_reason(Some("manual")), "manual");
    assert_eq!(normalize_update_reason(Some("AUTO")), "auto");
    assert_eq!(normalize_update_reason(Some(" Script "),), "script");
    assert_eq!(normalize_update_reason(Some("unknown")), "manual");
    assert_eq!(normalize_update_reason(None), "manual");
}

#[test]
fn test_is_no_update_path() {
    let patterns = vec!["ghost/master/noupdate.txt", "readme.txt"];
    assert!(is_no_update_path("ghost/master/noupdate.txt", &patterns));
    assert!(is_no_update_path("ghost\\master\\noupdate.txt", &patterns));
    assert!(is_no_update_path("dir/readme.txt", &patterns));
    assert!(!is_no_update_path("other.txt", &patterns));
    assert!(!is_no_update_path("", &patterns));
    assert!(!is_no_update_path("ghost/master/noupdate.txt", &[]));
}

#[test]
fn test_calculate_update_progress() {
    let p1 = calculate_update_progress(0, 10);
    assert_eq!(p1.percent(), 0);
    assert!(!p1.is_complete());

    let p2 = calculate_update_progress(5, 10);
    assert_eq!(p2.percent(), 50);
    assert!(!p2.is_complete());

    let p3 = calculate_update_progress(10, 10);
    assert_eq!(p3.percent(), 100);
    assert!(p3.is_complete());

    let p4 = calculate_update_progress(15, 10);
    assert_eq!(p4.percent(), 100);
    assert!(p4.is_complete());

    let p5 = calculate_update_progress(0, 0);
    assert_eq!(p5.percent(), 100);
    assert!(p5.is_complete());
}

#[test]
fn test_build_update_args() {
    let args = build_update_args(Build_update_argsParams {
        ref0: "f1",
        ref1: "f2",
        update_target: Some("shell"),
        update_mode: Some("auto"),
    });
    assert_eq!(args, ["f1", "f2", "", "shell", "auto"]);

    let def_args = build_update_args(Build_update_argsParams {
        ref0: "f1",
        ref1: "f2",
        update_target: None,
        update_mode: None,
    });
    assert_eq!(def_args, ["f1", "f2", "", "ghost", "manual"]);
}

#[test]
fn test_build_update_complete_args() {
    let args = build_update_complete_args(Build_update_complete_argsParams {
        result: Some("changed"),
        updated_files_count: 5,
        update_target: None,
        update_mode: None,
    });
    assert_eq!(args, ["changed", "5", "", "ghost", "manual"]);

    let def = build_update_complete_args(Build_update_complete_argsParams {
        result: None,
        updated_files_count: 0,
        update_target: None,
        update_mode: None,
    });
    assert_eq!(def, ["none", "0", "", "ghost", "manual"]);
}

#[test]
fn test_build_update_failure_args() {
    let args = build_update_failure_args(Build_update_failure_argsParams {
        error_or_reason: "HTTP 404 Not Found",
        failed_path: Some("file.txt"),
        update_target: None,
        update_mode: None,
    });
    assert_eq!(args, ["404", "file.txt", "", "ghost", "manual"]);

    let args_timeout = build_update_failure_args(Build_update_failure_argsParams {
        error_or_reason: "connection timeout",
        failed_path: None,
        update_target: None,
        update_mode: None,
    });
    assert_eq!(args_timeout, ["timeout", "", "", "ghost", "manual"]);

    let args_md5 = build_update_failure_args(Build_update_failure_argsParams {
        error_or_reason: "md5 miss match",
        failed_path: None,
        update_target: None,
        update_mode: None,
    });
    assert_eq!(args_md5, ["md5 miss", "", "", "ghost", "manual"]);

    let args_io = build_update_failure_args(Build_update_failure_argsParams {
        error_or_reason: "permission denied",
        failed_path: None,
        update_target: None,
        update_mode: None,
    });
    assert_eq!(args_io, ["fileio", "", "", "ghost", "manual"]);
}

#[test]
fn test_build_update_other_args() {
    let args = build_update_other_args(Build_update_other_argsParams {
        target_name: "master",
        target_type: Some("shell"),
        detail: Some("v1.0"),
        mode: Some("script"),
    });
    assert_eq!(args, ["master", "shell", "v1.0", "script"]);
}

#[test]
fn test_wasm_abi() {
    let packed = wasm_calculate_update_progress(5, 10);
    assert_eq!(packed & 0xFFFF, 50);
    assert_eq!((packed >> 16) & 0xFFFF, 0);

    let packed_done = wasm_calculate_update_progress(10, 10);
    assert_eq!(packed_done & 0xFFFF, 100);
    assert_eq!((packed_done >> 16) & 0xFFFF, 1);

    assert_eq!(wasm_normalize_update_reason(Some("auto".to_string())), 1);
    assert_eq!(wasm_normalize_update_reason(Some("script".to_string())), 2);
    assert_eq!(wasm_normalize_update_reason(Some("manual".to_string())), 0);
    assert_eq!(wasm_normalize_update_reason(None), 0);
}

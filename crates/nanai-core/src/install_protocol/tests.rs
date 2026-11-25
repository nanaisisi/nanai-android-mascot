use super::*;

#[test]
fn test_normalize_install_type() {
    assert_eq!(normalize_install_type(Some("ghost")), "ghost");
    assert_eq!(normalize_install_type(Some("SHELL")), "shell");
    assert_eq!(normalize_install_type(Some(" Balloon ")), "balloon");
    assert_eq!(normalize_install_type(Some("custom_type")), "custom_type");
    assert_eq!(normalize_install_type(Some("")), "unknown");
    assert_eq!(normalize_install_type(None), "unknown");
}

#[test]
fn test_build_install_begin_args() {
    assert_eq!(build_install_begin_args(None), ["install"]);
    assert_eq!(build_install_begin_args(Some("package")), ["package"]);
}

#[test]
fn test_build_install_complete_args() {
    let args = build_install_complete_args(Build_install_complete_argsParams {
        install_type: "ghost",
        name: "Emily",
        extra: Some("extra_path"),
    });
    assert_eq!(args, ["ghost", "Emily", "extra_path"]);

    let def_args = build_install_complete_args(Build_install_complete_argsParams {
        install_type: "shell",
        name: "Master",
        extra: None,
    });
    assert_eq!(def_args, ["shell", "Master", ""]);
}

#[test]
fn test_build_install_complete_ex_args() {
    let args = build_install_complete_ex_args(Build_install_complete_ex_argsParams {
        install_type: "balloon",
        name: "Simple",
        path_or_extra: Some("path/to/balloon"),
        on_install_script: Some("\\0\\s0Installed!\\e"),
    });
    assert_eq!(
        args,
        [
            "balloon",
            "Simple",
            "path/to/balloon",
            "\\0\\s0Installed!\\e"
        ]
    );
}

#[test]
fn test_build_install_complete_all_args() {
    let list = vec![
        ("ghost".to_string(), "Emily".to_string()),
        ("balloon".to_string(), "Simple".to_string()),
    ];
    let [count, result] = build_install_complete_all_args(&list);
    assert_eq!(count, "2");
    assert_eq!(result, "ghost\u{0001}Emily\nballoon\u{0001}Simple");
}

#[test]
fn test_build_install_refuse_args() {
    let args = build_install_refuse_args(Some("invalid name"), Some("target_ghost"));
    assert_eq!(args, ["invalid name", "target_ghost"]);

    let def = build_install_refuse_args(None, None);
    assert_eq!(def, ["refused", ""]);
}

#[test]
fn test_build_install_reroute_args() {
    let args = build_install_reroute_args(Build_install_reroute_argsParams {
        target_ghost: "Emily",
        install_type: "shell",
        name: "Master",
    });
    assert_eq!(args, ["Emily", "shell", "Master"]);
}

#[test]
fn test_parse_install_error_reason() {
    assert_eq!(
        parse_install_error_reason("Archive error: unsupported format"),
        "unsupported"
    );
    assert_eq!(
        parse_install_error_reason("User abort operation"),
        "artificial"
    );
    assert_eq!(
        parse_install_error_reason("Detected Zip-Slip attempt"),
        "invalid path"
    );
    assert_eq!(
        parse_install_error_reason("Corrupt lha archive header"),
        "unlha32 error"
    );
    assert_eq!(
        parse_install_error_reason("Permission denied write error"),
        "write error"
    );
    assert_eq!(
        parse_install_error_reason("Unknown internal error"),
        "extraction"
    );
}

#[test]
fn test_multi_resource_install() {
    let single = vec![("ghost".to_string(), "Emily".to_string())];
    assert!(!is_multi_resource_install(&single));

    let multi = vec![
        ("ghost".to_string(), "Emily".to_string()),
        ("shell".to_string(), "Master".to_string()),
    ];
    assert!(is_multi_resource_install(&multi));

    let res = build_install_multi_args(&multi);
    assert_eq!(res.count(), "2");
    assert!(res.is_multi());
}

#[test]
fn test_wasm_install_abi() {
    assert_eq!(
        wasm_parse_install_error_reason("zip-slip detected"),
        8 // invalid path
    );

    assert_eq!(
        wasm_parse_install_error_reason("cancel by user"),
        6 // artificial
    );

    assert_eq!(
        wasm_parse_install_error_reason("password required"),
        5 // password
    );

    assert_eq!(
        wasm_parse_install_error_reason("unsupported archive"),
        0 // unsupported
    );

    assert_eq!(
        wasm_parse_install_error_reason("permission denied"),
        7 // write error
    );

    assert_eq!(
        wasm_parse_install_error_reason("invalid format"),
        9 // format error
    );
}

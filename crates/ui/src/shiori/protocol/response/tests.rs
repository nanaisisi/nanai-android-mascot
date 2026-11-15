use super::*;
use super::super::super::types::*;

#[test]
fn test_shiori_response_constructors() {
    let no_cont = ShioriResponse::no_content();
    assert_eq!(no_cont.status, StatusCode::NoContent);
    assert!(!no_cont.is_teach_pending());

    let ok_res = ShioriResponse::ok("\\hHello");
    assert_eq!(ok_res.status, StatusCode::Ok);
    assert_eq!(ok_res.value.as_deref(), Some("\\hHello"));
    assert!(!ok_res.is_teach_pending());

    let mut teach_res = ShioriResponse {
        status: StatusCode::NotEnough,
        ..Default::default()
    };
    assert!(teach_res.is_teach_pending());
    teach_res.status = StatusCode::Advice;
    assert!(teach_res.is_teach_pending());
}

#[test]
fn test_response_helpers() {
    assert_eq!(
        helpers::key_str_prefix("X-SSTP-PassThru-CustomKey"),
        Some("CustomKey".to_string())
    );
    assert_eq!(helpers::key_str_prefix("InvalidKey"), None);

    assert!(helpers::is_header_key("X-Header-Name_1"));
    assert!(!helpers::is_header_key("Invalid Header"));
    assert!(!helpers::is_header_key(""));

    let mut res = ShioriResponse::ok("Line1");
    helpers::push_continuation(&mut res, Some("value"), "Line2");
    assert_eq!(res.value.as_deref(), Some("Line1\nLine2"));

    let mut res_notify = ShioriResponse::ok("Notify1");
    res_notify.value_notify = Some("Notify1".to_string());
    helpers::push_continuation(&mut res_notify, Some("value_notify"), "Notify2");
    assert_eq!(res_notify.value_notify.as_deref(), Some("Notify1\nNotify2"));

    helpers::push_continuation(&mut res_notify, Some("unknown"), "Ignored");

    let mut res_none = ShioriResponse::default();
    helpers::push_continuation(&mut res_none, Some("value"), "Ignored");
    helpers::push_continuation(&mut res_none, Some("value_notify"), "Ignored");

    let mut out = String::new();
    helpers::write_multiline_header(helpers::Write_multiline_headerParams {
        out: &mut out,
        name: "Header",
        value: "Line1\nLine2",
    });
    assert!(out.contains("Header: Line1"));
    assert!(out.contains("Line2"));
}

#[test]
fn test_shiori_response_getters() {
    let mut res = ShioriResponse::ok("Hello");
    res.charset = "UTF-8".into();
    res.sender = Some("Shiori".into());
    res.value_notify = Some("Notify".into());
    res.security_level = Some(SecurityLevel::Local);
    res.marker = Some("marker".into());
    res.error_level = vec![ErrorLevel::Warning];
    res.error_description = vec!["warn\u{1}desc".into()];
    res.balloon_offset = Some((10, 20));
    res.reference0 = Some("ref0".into());
    res.references = vec!["ref1".into()];
    res.age = Some(1);
    res.marker_send = Some("msend".into());
    res.passthru.insert("PK".into(), "PV".into());

    assert_eq!(res.status(), StatusCode::Ok);
    assert_eq!(res.charset(), "UTF-8");
    assert_eq!(res.sender(), Some("Shiori"));
    assert_eq!(res.value(), Some("Hello"));
    assert_eq!(res.value_notify(), Some("Notify"));
    assert_eq!(res.security_level(), Some(SecurityLevel::Local));
    assert_eq!(res.marker(), Some("marker"));
    assert_eq!(res.error_level(), &[ErrorLevel::Warning]);
    assert_eq!(res.error_description(), &["warn\u{1}desc".to_string()]);
    assert_eq!(res.balloon_offset(), Some((10, 20)));
    assert_eq!(res.reference0(), Some("ref0"));
    assert_eq!(res.references(), &["ref1".to_string()]);
    assert_eq!(res.age(), Some(1));
    assert_eq!(res.marker_send(), Some("msend"));
    assert_eq!(res.passthru().get("PK").map(|s| s.as_str()), Some("PV"));
}

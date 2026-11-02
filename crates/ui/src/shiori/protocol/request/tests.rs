use super::*;
use crate::shiori::types::*;

#[test]
fn test_shiori_request_get_and_notify() {
    let get_req = ShioriRequest::get("OnBoot", &["ref0".into()]);
    assert_eq!(get_req.method, ShioriMethod::Get);
    assert_eq!(get_req.id, "OnBoot");
    assert_eq!(get_req.references, vec!["ref0".to_string()]);

    let notify_req = ShioriRequest::notify("OnClose", &[]);
    assert_eq!(notify_req.method, ShioriMethod::Notify);
    assert_eq!(notify_req.id, "OnClose");
}

#[test]
fn test_shiori_request_parse_and_build() {
    let raw = "GET SHIORI/3.0\r\nCharset: UTF-8\r\nSender: TestGhost\r\nID: OnBoot\r\nReference0: val0\r\nReferenceABC: invalid\r\nUnknownHeader: ignored\r\n\r\n";
    let parsed = ShioriRequest::parse(raw).unwrap();
    assert_eq!(parsed.id, "OnBoot");
    assert_eq!(parsed.references[0], "val0");

    let built = parsed.build();
    assert!(built.contains("GET SHIORI/3.0"));
    assert!(built.contains("ID: OnBoot"));
    assert!(built.contains("Reference0: val0"));
}

#[test]
fn test_shiori_request_parse_errors() {
    assert_eq!(ShioriRequest::parse(""), Err("empty request".to_string()));
    assert_eq!(
        ShioriRequest::parse("   \r\n"),
        Err("empty request".to_string())
    );
    assert_eq!(
        ShioriRequest::parse("GET"),
        Err("missing protocol".to_string())
    );
    assert_eq!(
        ShioriRequest::parse("GET INVALID/1.0\r\nID: OnBoot\r\n\r\n"),
        Err("unsupported protocol version: INVALID/1.0".to_string())
    );
    assert_eq!(
        ShioriRequest::parse("GET SHIORI/2.0\r\nID: OnBoot\r\n\r\n"),
        Err("unsupported protocol version: SHIORI/2.0".to_string())
    );
    assert_eq!(
        ShioriRequest::parse("GET SHIORI/3.0\r\nCharset: UTF-8\r\n\r\n"),
        Err("ID header is missing".to_string())
    );
}

#[test]
fn test_shiori_request_parse_methods_and_versions() {
    // GET SHIORI/3.0
    let req_get = ShioriRequest::parse("GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n").unwrap();
    assert_eq!(req_get.method, ShioriMethod::Get);
    assert_eq!(req_get.id, "OnBoot");

    // NOTIFY SHIORI/3.0
    let req_notify = ShioriRequest::parse("NOTIFY SHIORI/3.0\r\nID: OnMinute\r\n\r\n").unwrap();
    assert_eq!(req_notify.method, ShioriMethod::Notify);
    assert_eq!(req_notify.id, "OnMinute");

    // Lowercase method & lowercase protocol
    let req_lower = ShioriRequest::parse("notify shiori/3.0\r\nid: OnSecond\r\n\r\n").unwrap();
    assert_eq!(req_lower.method, ShioriMethod::Notify);
    assert_eq!(req_lower.id, "OnSecond");

    // SHIORI/2.6 support
    let req_2_6 = ShioriRequest::parse("GET SHIORI/2.6\r\nID: OnBoot\r\n\r\n").unwrap();
    assert_eq!(req_2_6.method, ShioriMethod::Get);
    assert_eq!(req_2_6.id, "OnBoot");

    // Unrecognized method parses as Get by default
    let req_unknown = ShioriRequest::parse("OTHER SHIORI/3.0\r\nID: OnBoot\r\n\r\n").unwrap();
    assert_eq!(req_unknown.method, ShioriMethod::Get);
}

#[test]
fn test_shiori_request_parse_headers_case_insensitivity_and_trimming() {
    let text = "GET SHIORI/3.0\r\n  CHARSET  :   Shift_JIS  \r\n  SENDER  :   TestSender  \r\n  BASEID  :   BaseEvent  \r\n  ID  :   OnTestEvent  \r\n\r\n";
    let req = ShioriRequest::parse(text).unwrap();
    assert_eq!(req.charset, "Shift_JIS");
    assert_eq!(req.sender, "TestSender");
    assert_eq!(req.base_id.as_deref(), Some("BaseEvent"));
    assert_eq!(req.id, "OnTestEvent");
}

#[test]
fn test_shiori_request_parse_security_origin_variations() {
    // null origin -> Some(None)
    let text_null = "GET SHIORI/3.0\r\nID: OnTest\r\nSecurityOrigin: null\r\n\r\n";
    let req_null = ShioriRequest::parse(text_null).unwrap();
    assert_eq!(req_null.security_origin, Some(None));

    // NULL (case insensitive) -> Some(None)
    let text_null_upper = "GET SHIORI/3.0\r\nID: OnTest\r\nsecurityorigin: NULL\r\n\r\n";
    let req_null_upper = ShioriRequest::parse(text_null_upper).unwrap();
    assert_eq!(req_null_upper.security_origin, Some(None));

    // explicit origin URL -> Some(Some(...))
    let text_url =
        "GET SHIORI/3.0\r\nID: OnTest\r\nSecurityOrigin: https://example.com\r\n\r\n";
    let req_url = ShioriRequest::parse(text_url).unwrap();
    assert_eq!(
        req_url.security_origin,
        Some(Some("https://example.com".to_string()))
    );

    // omitted origin -> None
    let text_none = "GET SHIORI/3.0\r\nID: OnTest\r\n\r\n";
    let req_none = ShioriRequest::parse(text_none).unwrap();
    assert_eq!(req_none.security_origin, None);
}

#[test]
fn test_shiori_request_parse_sender_type_and_status() {
    let text = "GET SHIORI/3.0\r\nID: OnEvent\r\nSenderType: internal,raise,custom_source\r\nStatus: talking,balloon(0=1/1=2),opening(input)\r\nSecurityLevel: local\r\n\r\n";
    let req = ShioriRequest::parse(text).unwrap();

    assert_eq!(
        req.sender_type,
        vec![
            SenderTypeTag::Internal,
            SenderTypeTag::Raise,
            SenderTypeTag::Custom("custom_source".into())
        ]
    );
    assert_eq!(
        req.status,
        vec![
            GhostStatusToken::Talking,
            GhostStatusToken::Balloon(vec![(0, 1), (1, 2)]),
            GhostStatusToken::Opening("input".into())
        ]
    );
    assert_eq!(req.security_level, Some(SecurityLevel::Local));
}

#[test]
fn test_shiori_request_parse_references_edge_cases() {
    // Out-of-order and sparse references
    let text = "GET SHIORI/3.0\r\nID: OnEvent\r\nReference3: fourth\r\nReference0: first\r\nReference1: second\r\nReferenceX: ignored\r\n\r\n";
    let req = ShioriRequest::parse(text).unwrap();

    assert_eq!(req.references.len(), 4);
    assert_eq!(req.references[0], "first");
    assert_eq!(req.references[1], "second");
    assert_eq!(req.references[2], "");
    assert_eq!(req.references[3], "fourth");
}

#[test]
fn test_shiori_request_parse_passthru_headers() {
    let text = "GET SHIORI/3.0\r\nID: OnEvent\r\nX-SSTP-PassThru-CustomParam: test_value\r\nx-sstp-passthru-lowerparam: second_val\r\nx-sstp-passthru-markersend: ignored\r\n\r\n";
    let req = ShioriRequest::parse(text).unwrap();

    assert_eq!(
        req.passthru.get("CustomParam").map(String::as_str),
        Some("test_value")
    );
    assert_eq!(
        req.passthru.get("lowerparam").map(String::as_str),
        Some("second_val")
    );
    assert!(!req.passthru.contains_key("markersend"));
}

#[test]
fn test_shiori_request_parse_line_endings_and_termination() {
    // LF endings and skipping lines without colon
    let text_lf = "GET SHIORI/3.0\nID: OnBoot\nInvalidLineWithoutColon\nReference0: val0\n\nIgnoredAfterBlankLine: foo\n";
    let req = ShioriRequest::parse(text_lf).unwrap();
    assert_eq!(req.id, "OnBoot");
    assert_eq!(req.references, vec!["val0".to_string()]);
    assert_eq!(req.sender, ""); // not set

    // CRLF endings
    let text_crlf = "GET SHIORI/3.0\r\nID: OnBoot\r\nReference0: val0\r\n\r\n";
    let req_crlf = ShioriRequest::parse(text_crlf).unwrap();
    assert_eq!(req, req_crlf);
}

#[test]
fn test_shiori_request_build_all_headers() {
    let mut req = ShioriRequest::get("OnBoot", &["ref0".into()]);
    req.sender_type = vec![SenderTypeTag::Internal];
    req.security_level = Some(SecurityLevel::Local);
    req.security_origin = Some(Some("localhost".into()));
    req.status = vec![GhostStatusToken::Talking];
    req.base_id = Some("OnBootBase".into());
    req.passthru.insert("CustomKey".into(), "CustomVal".into());

    let built = req.build();
    assert!(built.contains("SenderType: internal"));
    assert!(built.contains("SecurityLevel: local"));
    assert!(built.contains("SecurityOrigin: localhost"));
    assert!(built.contains("Status: talking"));
    assert!(built.contains("BaseID: OnBootBase"));
    assert!(built.contains("X-SSTP-PassThru-CustomKey: CustomVal"));

    req.security_origin = Some(None);
    assert!(req.build().contains("SecurityOrigin: null"));
}

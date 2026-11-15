use super::super::*;
use super::super::super::super::types::*;

#[test]
fn test_shiori_request_parse_security_origin_variations() {
    let text_null = "GET SHIORI/3.0\r\nID: OnTest\r\nSecurityOrigin: null\r\n\r\n";
    let req_null = ShioriRequest::parse(text_null).unwrap();
    assert_eq!(req_null.security_origin, Some(None));

    let text_null_upper = "GET SHIORI/3.0\r\nID: OnTest\r\nsecurityorigin: NULL\r\n\r\n";
    let req_null_upper = ShioriRequest::parse(text_null_upper).unwrap();
    assert_eq!(req_null_upper.security_origin, Some(None));

    let text_url = "GET SHIORI/3.0\r\nID: OnTest\r\nSecurityOrigin: https://example.com\r\n\r\n";
    let req_url = ShioriRequest::parse(text_url).unwrap();
    assert_eq!(
        req_url.security_origin,
        Some(Some("https://example.com".to_string()))
    );

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

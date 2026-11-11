//! SHIORI/3.0 プロトコル拡張エッジケース・異常系テスト
//!
//! リクエスト解析、レスポンス構築・パース、エラーレベル、SSPヘッダの振る舞いを網羅検証する。

use crate::shiori::protocol::{ShioriRequest, ShioriResponse};
use crate::shiori::types::{
    ErrorLevel, GhostStatusToken, SecurityLevel, SenderTypeTag, StatusCode,
};

#[test]
fn test_shiori_request_builder_fluent_api() {
    let mut req = ShioriRequest::get("OnSecondChange", &["ref0_val".to_string()]);
    req.sender = "SSP".to_string();
    req.sender_type = vec![SenderTypeTag::Internal, SenderTypeTag::Communicate];
    req.security_level = Some(SecurityLevel::Local);
    req.security_origin = Some(Some("file://dummy".to_string()));
    req.status = vec![GhostStatusToken::Talking, GhostStatusToken::Passive];
    req.base_id = Some("base_event_1".to_string());
    req.references.push("ref1_val".to_string());
    req.references.push("ref2_val".to_string());
    req.references.push("ref3_val".to_string());
    req.passthru
        .insert("X-Custom".to_string(), "val".to_string());

    let wire = req.build();
    assert!(wire.starts_with("GET SHIORI/3.0\r\n"));
    assert!(wire.contains("ID: OnSecondChange\r\n"));
    assert!(wire.contains("Sender: SSP\r\n"));
    assert!(wire.contains("SenderType: internal,communicate\r\n"));
    assert!(wire.contains("SecurityLevel: local\r\n"));
    assert!(wire.contains("SecurityOrigin: file://dummy\r\n"));
    assert!(wire.contains("Status: talking,passive\r\n"));
    assert!(wire.contains("BaseID: base_event_1\r\n"));
    assert!(wire.contains("Reference0: ref0_val\r\n"));
    assert!(wire.contains("Reference3: ref3_val\r\n"));
    assert!(wire.contains("X-SSTP-PassThru-X-Custom: val\r\n"));
    assert!(wire.ends_with("\r\n\r\n"));

    // Roundtrip parse
    let parsed = ShioriRequest::parse(&wire).expect("Failed to parse serialized request");
    assert_eq!(parsed.id, "OnSecondChange");
    assert_eq!(parsed.sender, "SSP");
    assert_eq!(parsed.security_level, Some(SecurityLevel::Local));
    assert_eq!(parsed.base_id.as_deref(), Some("base_event_1"));
    assert_eq!(
        parsed.references.get(0).map(String::as_str),
        Some("ref0_val")
    );
    assert_eq!(
        parsed.references.get(3).map(String::as_str),
        Some("ref3_val")
    );
    assert_eq!(
        parsed.passthru.get("X-Custom").map(String::as_str),
        Some("val")
    );
}

#[test]
fn test_shiori_response_status_code_coverage() {
    let codes = [
        (StatusCode::Ok, 200, "OK"),
        (StatusCode::NoContent, 204, "No Content"),
        (StatusCode::NotEnough, 311, "Not Enough"),
        (StatusCode::Advice, 312, "Advice"),
        (StatusCode::BadRequest, 400, "Bad Request"),
        (StatusCode::InternalError, 500, "Internal Server Error"),
    ];

    for (code, expected_num, expected_desc) in codes {
        assert_eq!(code.code(), expected_num);
        assert_eq!(code.text(), expected_desc);

        let parsed = StatusCode::parse(expected_num);
        assert_eq!(parsed, code);
    }

    assert_eq!(StatusCode::parse(999), StatusCode::Other(999));
    assert_eq!(StatusCode::parse(100), StatusCode::Other(100));
}

#[test]
fn test_shiori_response_multiline_and_extended_headers() {
    let mut resp = ShioriResponse::ok("\\0\\s[0]こんにちは。\\e");
    resp.value_notify = Some("\\0\\s[0]通知スクリプト\\e".to_string());
    resp.marker = Some("anchor1".to_string());
    resp.marker_send = Some("marker_send_val".to_string());
    resp.balloon_offset = Some((10, 20));
    resp.age = Some(42);
    resp.error_level = vec![ErrorLevel::Warning, ErrorLevel::Notice];
    resp.error_description = vec![
        "Warning details here".to_string(),
        "Notice details".to_string(),
    ];
    resp.reference0 = Some("TargetGhost".to_string());
    resp.references = vec!["custom_ref_1".to_string()];
    resp.passthru
        .insert("HeaderKey".to_string(), "HeaderVal".to_string());

    let wire = resp.build();
    assert!(wire.starts_with("SHIORI/3.0 200 OK\r\n"));
    assert!(wire.contains("Charset: UTF-8\r\n"));
    assert!(wire.contains("Value: \\0\\s[0]こんにちは。\\e\r\n"));
    assert!(wire.contains("ValueNotify: \\0\\s[0]通知スクリプト\\e\r\n"));
    assert!(wire.contains("Marker: anchor1\r\n"));
    assert!(wire.contains("MarkerSend: marker_send_val\r\n"));
    assert!(wire.contains("BalloonOffset: 10,20\r\n"));
    assert!(wire.contains("Age: 42\r\n"));
    assert!(wire.contains("Reference0: TargetGhost\r\n"));
    assert!(wire.contains("Reference1: custom_ref_1\r\n"));
    assert!(wire.contains("X-SSTP-PassThru-HeaderKey: HeaderVal\r\n"));

    let parsed = ShioriResponse::parse(&wire).expect("Failed to parse response");
    assert_eq!(parsed.status, StatusCode::Ok);
    assert_eq!(parsed.value.as_deref(), Some("\\0\\s[0]こんにちは。\\e"));
    assert_eq!(
        parsed.value_notify.as_deref(),
        Some("\\0\\s[0]通知スクリプト\\e")
    );
    assert_eq!(parsed.marker.as_deref(), Some("anchor1"));
    assert_eq!(parsed.marker_send.as_deref(), Some("marker_send_val"));
    assert_eq!(parsed.balloon_offset, Some((10, 20)));
    assert_eq!(parsed.age, Some(42));
    assert_eq!(parsed.reference0.as_deref(), Some("TargetGhost"));
    assert_eq!(
        parsed.references.get(0).map(String::as_str),
        Some("custom_ref_1")
    );
    assert_eq!(
        parsed.passthru.get("HeaderKey").map(String::as_str),
        Some("HeaderVal")
    );
}

#[test]
fn test_shiori_response_error_level_all_variants_roundtrip() {
    let levels = vec![
        ErrorLevel::Info,
        ErrorLevel::Notice,
        ErrorLevel::Warning,
        ErrorLevel::Error,
        ErrorLevel::Critical,
    ];

    let resp = ShioriResponse {
        status: StatusCode::BadRequest,
        error_level: levels.clone(),
        ..Default::default()
    };
    let wire = resp.build();

    let parsed = ShioriResponse::parse(&wire).expect("Failed to parse response with error levels");
    assert_eq!(parsed.status, StatusCode::BadRequest);
    assert_eq!(parsed.error_level, levels);
}

#[test]
fn test_shiori_request_notify_helper() {
    let req = ShioriRequest::notify("OnBoot", &["arg0".to_string()]);
    assert_eq!(req.id, "OnBoot");
    assert_eq!(req.references, vec!["arg0".to_string()]);
    let wire = req.build();
    assert!(wire.starts_with("NOTIFY SHIORI/3.0\r\n"));
    assert!(wire.contains("ID: OnBoot\r\n"));
    assert!(wire.contains("Reference0: arg0\r\n"));
}

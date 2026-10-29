use super::super::*;

#[test]
fn test_response_status_codes() {
    assert_eq!(StatusCode::parse(200), StatusCode::Ok);
    assert_eq!(StatusCode::parse(204), StatusCode::NoContent);
    assert_eq!(StatusCode::parse(311), StatusCode::NotEnough);
    assert_eq!(StatusCode::parse(312), StatusCode::Advice);
    assert_eq!(StatusCode::parse(400), StatusCode::BadRequest);
    assert_eq!(StatusCode::parse(500), StatusCode::InternalError);
    assert_eq!(StatusCode::parse(599), StatusCode::Other(599));
    assert_eq!(StatusCode::Ok.code(), 200);
    assert_eq!(StatusCode::NoContent.text(), "No Content");
    assert_eq!(StatusCode::NotEnough.text(), "Not Enough");
    assert_eq!(StatusCode::Advice.text(), "Advice");
}

#[test]
fn test_parse_response_ok_with_multiline_value() {
    let text =
        "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nSender: AYA\r\nValue: line1\r\nline2\r\n\r\n";
    let res = ShioriResponse::parse(text).unwrap();
    assert_eq!(res.status, StatusCode::Ok);
    assert_eq!(res.sender.as_deref(), Some("AYA"));
    assert_eq!(res.value.as_deref(), Some("line1\nline2"));

    let built = res.build();
    assert!(built.starts_with("SHIORI/3.0 200 OK\r\n"));
    assert!(built.contains("Value: line1\r\n"));
    assert!(built.contains("line2\r\n"));
    assert!(built.ends_with("\r\n\r\n"));

    let back = ShioriResponse::parse(&built).unwrap();
    assert_eq!(back.value.as_deref(), Some("line1\nline2"));
}

#[test]
fn test_parse_response_extensions() {
    let text = "SHIORI/3.0 500 Internal Server Error\r\nErrorLevel: error\u{1}warning\r\nErrorDescription: 記述ミス\u{1}文法注意\r\nBalloonOffset: 10,-5\r\n\r\n";
    let res = ShioriResponse::parse(text).unwrap();
    assert_eq!(res.status, StatusCode::InternalError);
    assert_eq!(
        res.error_level,
        vec![ErrorLevel::Error, ErrorLevel::Warning]
    );
    assert_eq!(res.error_description, vec!["記述ミス", "文法注意"]);
    assert_eq!(res.balloon_offset, Some((10, -5)));
    assert!(res.build().contains("ErrorLevel: error\u{1}warning\r\n"));
    assert!(res.build().contains("BalloonOffset: 10,-5\r\n"));
}

#[test]
fn test_parse_response_communicate() {
    let text = "SHIORI/3.0 200 OK\r\nReference0: ghostA\r\nReference1: 返信本文\r\nAge: 1\r\nMarkerSend: processing\r\nX-SSTP-PassThru-Post: applied\r\n\r\n";
    let res = ShioriResponse::parse(text).unwrap();
    assert_eq!(res.reference0.as_deref(), Some("ghostA"));
    assert_eq!(res.references, vec!["返信本文".to_string()]);
    assert_eq!(res.age, Some(1));
    assert_eq!(res.marker_send.as_deref(), Some("processing"));
    assert_eq!(
        res.passthru.get("Post").map(String::as_str),
        Some("applied")
    );

    let built = res.build();
    assert!(built.contains("Reference0: ghostA\r\n"));
    assert!(built.contains("Reference1: 返信本文\r\n"));
    assert!(built.contains("Age: 1\r\n"));
    assert!(built.contains("MarkerSend: processing\r\n"));
    assert!(built.contains("X-SSTP-PassThru-Post: applied\r\n"));
}

#[test]
fn test_response_no_content() {
    let text = ShioriResponse::no_content().build();
    assert!(text.starts_with("SHIORI/3.0 204 No Content\r\n"));
    let parsed = ShioriResponse::parse(&text).unwrap();
    assert_eq!(parsed.status, StatusCode::NoContent);
    assert!(parsed.value.is_none());

    let empty = ShioriResponse::parse("").unwrap_err();
    assert!(!empty.is_empty());
}

#[test]
fn test_response_teach_pending() {
    let not_enough = ShioriResponse::parse("SHIORI/3.0 311 Not Enough\r\n\r\n").unwrap();
    assert!(not_enough.is_teach_pending());

    let advice = ShioriResponse::parse("SHIORI/3.0 312 Advice\r\n\r\n").unwrap();
    assert!(advice.is_teach_pending());

    assert!(!ShioriResponse::ok("script").is_teach_pending());
    assert!(!ShioriResponse::no_content().is_teach_pending());
}

#[test]
fn test_response_legacy_version() {
    let text = "SHIORI/2.2 200 OK\r\nCharset: Shift_JIS\r\nSender: Kawari\r\nValue: legacy response\r\n\r\n";
    let res = ShioriResponse::parse(text).unwrap();
    assert_eq!(res.status, StatusCode::Ok);
    assert_eq!(res.sender.as_deref(), Some("Kawari"));
    assert_eq!(res.value.as_deref(), Some("legacy response"));
}

use super::super::*;
use super::super::super::super::types::*;

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
    let req_get = ShioriRequest::parse("GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n").unwrap();
    assert_eq!(req_get.method, ShioriMethod::Get);
    assert_eq!(req_get.id, "OnBoot");

    let req_notify = ShioriRequest::parse("NOTIFY SHIORI/3.0\r\nID: OnMinute\r\n\r\n").unwrap();
    assert_eq!(req_notify.method, ShioriMethod::Notify);
    assert_eq!(req_notify.id, "OnMinute");

    let req_lower = ShioriRequest::parse("notify shiori/3.0\r\nid: OnSecond\r\n\r\n").unwrap();
    assert_eq!(req_lower.method, ShioriMethod::Notify);
    assert_eq!(req_lower.id, "OnSecond");

    let req_2_6 = ShioriRequest::parse("GET SHIORI/2.6\r\nID: OnBoot\r\n\r\n").unwrap();
    assert_eq!(req_2_6.method, ShioriMethod::Get);
    assert_eq!(req_2_6.id, "OnBoot");

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
fn test_shiori_request_parse_line_endings_and_termination() {
    let text_lf = "GET SHIORI/3.0\nID: OnBoot\nInvalidLineWithoutColon\nReference0: val0\n\nIgnoredAfterBlankLine: foo\n";
    let req = ShioriRequest::parse(text_lf).unwrap();
    assert_eq!(req.id, "OnBoot");
    assert_eq!(req.references, vec!["val0".to_string()]);
    assert_eq!(req.sender, "");

    let text_crlf = "GET SHIORI/3.0\r\nID: OnBoot\r\nReference0: val0\r\n\r\n";
    let req_crlf = ShioriRequest::parse(text_crlf).unwrap();
    assert_eq!(req, req_crlf);
}

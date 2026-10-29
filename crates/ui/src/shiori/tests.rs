use super::*;

#[test]
fn test_build_request_ukadoc_sample() {
    let req = ShioriRequest {
        method: ShioriMethod::Get,
        charset: "UTF-8".into(),
        sender: "SSP".into(),
        sender_type: parse_sender_types("internal,raise"),
        security_level: Some(SecurityLevel::Local),
        security_origin: Some(None),
        status: GhostStatusToken::parse_list("choosing,balloon(0=0)"),
        id: "OnFirstBoot".into(),
        base_id: Some("OnBoot".into()),
        references: vec!["1".into()],
        passthru: Default::default(),
    };
    let text = req.build();

    assert!(text.contains("GET SHIORI/3.0\r\n"));
    assert!(text.contains("SenderType: internal,raise\r\n"));
    assert!(text.contains("SecurityLevel: local\r\n"));
    assert!(text.contains("SecurityOrigin: null\r\n"));
    assert!(text.contains("Status: choosing,balloon(0=0)\r\n"));
    assert!(text.contains("BaseID: OnBoot\r\n"));
    assert!(text.contains("ID: OnFirstBoot\r\n"));
    assert!(text.contains("Reference0: 1\r\n"));
    assert!(text.ends_with("\r\n\r\n"));

    let sec_pos = text.find("SecurityLevel").unwrap();
    let id_pos = text.find("ID: OnFirstBoot").unwrap();
    assert!(sec_pos < id_pos);

    let parsed = ShioriRequest::parse(&text).unwrap();
    assert_eq!(parsed.method, ShioriMethod::Get);
    assert_eq!(parsed.sender, "SSP");
    assert_eq!(
        parsed.sender_type,
        vec![SenderTypeTag::Internal, SenderTypeTag::Raise]
    );
    assert_eq!(parsed.security_level, Some(SecurityLevel::Local));
    assert_eq!(parsed.security_origin, Some(Option::<String>::None));
    assert_eq!(
        parsed.status,
        vec![
            GhostStatusToken::Choosing,
            GhostStatusToken::Balloon(vec![(0, 0)])
        ]
    );
    assert_eq!(parsed.id, "OnFirstBoot");
    assert_eq!(parsed.base_id.as_deref(), Some("OnBoot"));
    assert_eq!(parsed.references, vec!["1".to_string()]);
}

#[test]
fn test_parse_request_passthru_and_notify() {
    let text = "NOTIFY SHIORI/3.0\r\nCharset: UTF-8\r\nSender: NanaiAndroidMascot\r\nID: OnSecondChange\r\nReference0: 5\r\nX-SSTP-PassThru-Custom: sample\r\n\r\n";
    let req = ShioriRequest::parse(text).unwrap();
    assert_eq!(req.method, ShioriMethod::Notify);
    assert_eq!(req.id, "OnSecondChange");
    assert_eq!(req.references.len(), 1);
    assert_eq!(
        req.passthru.get("Custom").map(String::as_str),
        Some("sample")
    );
    assert_eq!(req.build(), text, "パース→ビルドで逐次一致する");
}

#[test]
fn test_parse_request_empty_and_missing_protocol() {
    assert_eq!(ShioriRequest::parse(""), Err("empty request".to_string()));
    assert_eq!(
        ShioriRequest::parse("   \r\n"),
        Err("empty request".to_string())
    );
    assert_eq!(
        ShioriRequest::parse("GET"),
        Err("missing protocol".to_string())
    );
}

#[test]
fn test_parse_request_unsupported_version() {
    let err = ShioriRequest::parse("GET SHIORI/2.0\r\nID: OnBoot\r\n\r\n").unwrap_err();
    assert_eq!(err, "unsupported protocol version: SHIORI/2.0");

    let err_http = ShioriRequest::parse("GET HTTP/1.1\r\nID: OnBoot\r\n\r\n").unwrap_err();
    assert_eq!(err_http, "unsupported protocol version: HTTP/1.1");
}

#[test]
fn test_parse_request_missing_id() {
    let err = ShioriRequest::parse("GET SHIORI/3.0\r\nSender: SSP\r\n\r\n").unwrap_err();
    assert_eq!(err, "ID header is missing");
}

#[test]
fn test_parse_request_protocol_versions() {
    let text_2_6 = "GET SHIORI/2.6\r\nID: OnBoot\r\n\r\n";
    let req_2_6 = ShioriRequest::parse(text_2_6).unwrap();
    assert_eq!(req_2_6.id, "OnBoot");

    let text_lowercase = "get shiori/3.0\r\nid: OnBoot\r\n\r\n";
    let req_lower = ShioriRequest::parse(text_lowercase).unwrap();
    assert_eq!(req_lower.method, ShioriMethod::Get);
    assert_eq!(req_lower.id, "OnBoot");
}

#[test]
fn test_parse_request_headers_and_security_origin() {
    let text_null_origin =
        "GET SHIORI/3.0\r\nID: OnTest\r\nSecurityOrigin: null\r\nSecurityLevel: external\r\n\r\n";
    let req_null = ShioriRequest::parse(text_null_origin).unwrap();
    assert_eq!(req_null.security_origin, Some(None));
    assert_eq!(req_null.security_level, Some(SecurityLevel::External));

    let text_val_origin = "GET SHIORI/3.0\r\nID: OnTest\r\nSecurityOrigin: http://example.com\r\n\r\n";
    let req_val = ShioriRequest::parse(text_val_origin).unwrap();
    assert_eq!(
        req_val.security_origin,
        Some(Some("http://example.com".to_string()))
    );

    let text_no_origin = "GET SHIORI/3.0\r\nID: OnTest\r\n\r\n";
    let req_no_origin = ShioriRequest::parse(text_no_origin).unwrap();
    assert_eq!(req_no_origin.security_origin, None);
}

#[test]
fn test_parse_request_sparse_references_and_passthru() {
    let text = "GET SHIORI/3.0\r\nID: OnEvent\r\nReference2: val2\r\nReference0: val0\r\nInvalidHeaderLineWithoutColon\r\nX-SSTP-PassThru-HeaderOne: foo\r\nx-sstp-passthru-headertwo: bar\r\nx-sstp-passthru-markersend: ignored\r\n\r\n";
    let req = ShioriRequest::parse(text).unwrap();
    assert_eq!(req.references.len(), 3);
    assert_eq!(req.references[0], "val0");
    assert_eq!(req.references[1], "");
    assert_eq!(req.references[2], "val2");
    assert_eq!(req.passthru.get("HeaderOne").map(String::as_str), Some("foo"));
    assert_eq!(req.passthru.get("headertwo").map(String::as_str), Some("bar"));
    assert!(!req.passthru.contains_key("markersend"));
}

#[test]
fn test_parse_request_crlf_and_lf() {
    let text_lf = "GET SHIORI/3.0\nSender: SSP\nID: OnBoot\nReference0: ref0\n\n";
    let text_crlf = "GET SHIORI/3.0\r\nSender: SSP\r\nID: OnBoot\r\nReference0: ref0\r\n\r\n";

    let req_lf = ShioriRequest::parse(text_lf).unwrap();
    let req_crlf = ShioriRequest::parse(text_crlf).unwrap();

    assert_eq!(req_lf, req_crlf);
}

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

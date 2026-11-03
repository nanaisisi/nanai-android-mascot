use crate::sstp::*;

#[test]
fn test_sstp_method_parsing_and_as_str() {
    assert_eq!(SstpMethod::parse("SEND"), Some(SstpMethod::Send));
    assert_eq!(SstpMethod::parse("notify"), Some(SstpMethod::Notify));
    assert_eq!(SstpMethod::parse("EXECUTE"), Some(SstpMethod::Execute));
    assert_eq!(
        SstpMethod::parse("COMMUNICATE"),
        Some(SstpMethod::Communicate)
    );
    assert_eq!(SstpMethod::parse("give"), Some(SstpMethod::Give));
    assert_eq!(SstpMethod::parse("UNKNOWN"), None);

    assert_eq!(SstpMethod::Send.as_str(), "SEND");
    assert_eq!(SstpMethod::Notify.as_str(), "NOTIFY");
    assert_eq!(SstpMethod::Execute.as_str(), "EXECUTE");
    assert_eq!(SstpMethod::Communicate.as_str(), "COMMUNICATE");
    assert_eq!(SstpMethod::Give.as_str(), "GIVE");
}

#[test]
fn test_sstp_status_codes() {
    assert_eq!(SstpStatusCode::Ok.code(), 200);
    assert_eq!(SstpStatusCode::Ok.reason_phrase(), "OK");
    assert_eq!(SstpStatusCode::NoContent.code(), 204);
    assert_eq!(SstpStatusCode::NoContent.reason_phrase(), "No Content");
    assert_eq!(SstpStatusCode::BadRequest.code(), 400);
    assert_eq!(SstpStatusCode::BadRequest.reason_phrase(), "Bad Request");
    assert_eq!(SstpStatusCode::NotFound.code(), 404);
    assert_eq!(SstpStatusCode::NotFound.reason_phrase(), "Not Found");
    assert_eq!(SstpStatusCode::Conflict.code(), 409);
    assert_eq!(SstpStatusCode::Conflict.reason_phrase(), "Conflict");
    assert_eq!(SstpStatusCode::Break.code(), 210);
    assert_eq!(SstpStatusCode::Break.reason_phrase(), "Break");
    assert_eq!(SstpStatusCode::RequestTimeout.code(), 408);
    assert_eq!(
        SstpStatusCode::RequestTimeout.reason_phrase(),
        "Request Timeout"
    );
    assert_eq!(SstpStatusCode::PayloadTooLarge.code(), 413);
    assert_eq!(
        SstpStatusCode::PayloadTooLarge.reason_phrase(),
        "Payload Too Large"
    );
    assert_eq!(SstpStatusCode::Refuse.code(), 420);
    assert_eq!(SstpStatusCode::Refuse.reason_phrase(), "Refuse");
    assert_eq!(SstpStatusCode::InternalServerError.code(), 500);
    assert_eq!(
        SstpStatusCode::InternalServerError.reason_phrase(),
        "Internal Server Error"
    );
    assert_eq!(SstpStatusCode::NotImplemented.code(), 501);
    assert_eq!(
        SstpStatusCode::NotImplemented.reason_phrase(),
        "Not Implemented"
    );
    assert_eq!(SstpStatusCode::ServiceUnavailable.code(), 503);
    assert_eq!(
        SstpStatusCode::ServiceUnavailable.reason_phrase(),
        "Service Unavailable"
    );
    assert_eq!(SstpStatusCode::VersionNotSupported.code(), 505);
    assert_eq!(
        SstpStatusCode::VersionNotSupported.reason_phrase(),
        "Version Not Supported"
    );
    assert_eq!(SstpStatusCode::Invisible.code(), 512);
    assert_eq!(SstpStatusCode::Invisible.reason_phrase(), "Invisible");
}

#[test]
fn test_sstp_response_helpers_and_additional_data_formatting() {
    let nc = SstpResponse::no_content();
    assert_eq!(nc.status, SstpStatusCode::NoContent);

    let bad = SstpResponse::bad_request();
    assert_eq!(bad.status, SstpStatusCode::BadRequest);

    let not_found = SstpResponse::not_found();
    assert_eq!(not_found.status, SstpStatusCode::NotFound);

    let server_err = SstpResponse::internal_server_error();
    assert_eq!(server_err.status, SstpStatusCode::InternalServerError);

    let mut res_without_trailing_newline = SstpResponse::ok(None);
    res_without_trailing_newline.additional_data = Some("single line data".to_string());
    let built = res_without_trailing_newline.build();
    assert!(built.contains("single line data\r\n\r\n"));

    let err_res = SstpResponse::bad_request().with_error_description("custom error");
    assert!(
        err_res
            .build()
            .contains("ErrorDescription: custom error\r\n")
    );
}

#[test]
fn test_sstp_request_parser_edge_cases() {
    // Empty request
    assert!(SstpRequest::parse("").is_err());
    assert!(SstpRequest::parse("   \r\n").is_err());
    // Invalid request line
    assert!(SstpRequest::parse("INVALID").is_err());
    // Unsupported method
    assert!(SstpRequest::parse("FOOBAR SSTP/1.1\r\n").is_err());

    // Comprehensive headers: Event, SecurityOrigin, ReceiverGhostHWnd, Ghost, etc.
    let full_raw = "NOTIFY SSTP/1.1\r\n\
        Event: OnTest\r\n\
        SecurityOrigin: null\r\n\
        ReceiverGhostHWnd: 9999\r\n\
        Ghost: Sakura\r\n\
        Entry: EntryVal\r\n\
        KeepAlive: true\r\n\
        \r\n";
    let req = SstpRequest::parse(full_raw).unwrap();
    assert_eq!(req.event, Some("OnTest".to_string()));
    assert_eq!(req.security_origin, Some("null".to_string()));
    assert_eq!(req.receiver_ghost_hwnd, Some(9999));
    assert_eq!(req.ghost, Some("Sakura".to_string()));
    assert_eq!(req.entry, Some("EntryVal".to_string()));
    assert!(req.keep_alive);
    assert_eq!(req.sender, "Unknown");

    // Connection: keep-alive ヘッダテスト
    let keep_raw = "EXECUTE SSTP/1.4\r\nCharset: UTF-8\r\nSender: Client\r\nCommand: GetVersion\r\nConnection: keep-alive\r\n\r\n";
    let req_k = SstpRequest::parse(keep_raw).unwrap();
    assert!(req_k.keep_alive);
    assert_eq!(req_k.connection, Some("keep-alive".to_string()));

    let close_raw = "EXECUTE SSTP/1.4\r\nCharset: UTF-8\r\nSender: Client\r\nCommand: GetVersion\r\nConnection: close\r\n\r\n";
    let req_c = SstpRequest::parse(close_raw).unwrap();
    assert!(!req_c.keep_alive);
    assert_eq!(req_c.connection, Some("close".to_string()));
}

#[test]
fn test_parse_raw_send_request() {
    let raw = "SEND SSTP/1.4\r\nCharset: UTF-8\r\nSender: SampleApp\r\nScript: \\h\\s[0]こんにちは。\\e\r\nOption: nobreak, notranslate\r\nReference0: data0\r\n";
    let req = SstpRequest::parse(raw).unwrap();
    assert_eq!(req.method, SstpMethod::Send);
    assert_eq!(req.version, "SSTP/1.4");
    assert_eq!(req.charset, Some("UTF-8".to_string()));
    assert_eq!(req.sender, "SampleApp");
    assert_eq!(req.script, Some("\\h\\s[0]こんにちは。\\e".to_string()));
    assert_eq!(req.options, vec!["nobreak", "notranslate"]);
    assert_eq!(req.references.get("Reference0"), Some(&"data0".to_string()));
    assert!(!req.is_direct);
}

#[test]
fn test_sstp_id_and_options_parsing() {
    let raw = "SEND SSTP/1.4\r\nSender: TestTool\r\nID: ssp_fmo_header_001\r\nOption: nobreak, nodescript, strict, notranslate, notify\r\nScript: \\0Hello\\e\r\n";
    let req = SstpRequest::parse(raw).unwrap();
    assert_eq!(req.id, Some("ssp_fmo_header_001".to_string()));
    assert!(req.is_nobreak());
    assert!(req.is_nodescript());
    assert!(req.is_strict());
    assert!(req.is_notranslate());
    assert!(req.is_notify());
    assert_eq!(req.security_level, Some("local".to_string()));
    assert!(req.has_option("nobreak"));
    assert!(!req.has_option("unknown_opt"));
}

#[test]
fn test_parse_if_ghost_and_resolution() {
    let raw = "SEND SSTP/1.4\r\nSender: SampleApp\r\nScript: \\h\\s[0]デフォルト\\e\r\nIfGhost: まゆら\r\nScript: \\h\\s[0]まゆらさん\\e\r\nIfGhost: 花ちゃん,妹\r\nScript: \\h\\s[0]花ちゃんと妹さん\\e\r\n";
    let req = SstpRequest::parse(raw).unwrap();
    assert_eq!(req.script, Some("\\h\\s[0]デフォルト\\e".to_string()));
    assert_eq!(req.if_ghosts.len(), 2);

    assert_eq!(
        req.resolve_script("まゆら", "うにゅう"),
        Some("\\h\\s[0]まゆらさん\\e")
    );
    assert_eq!(
        req.resolve_script("花ちゃん", "妹"),
        Some("\\h\\s[0]花ちゃんと妹さん\\e")
    );
    assert_eq!(
        req.resolve_script("さくら", "うにゅう"),
        Some("\\h\\s[0]デフォルト\\e")
    );
}

#[test]
fn test_sstp_message_alias_and_give_parsing() {
    let raw_give = "GIVE SSTP/1.1\r\nSender: ExternalClient\r\nDocument: サンプル文章\r\nSong: 桜の木の下で\r\nScript: \\0\\s[0]プレゼント\\e\r\n";
    let msg: SstpMessage = SstpRequest::parse(raw_give).unwrap();
    assert_eq!(msg.method, SstpMethod::Give);
    assert_eq!(msg.sender, "ExternalClient");
    assert_eq!(msg.document, Some("サンプル文章".to_string()));
    assert_eq!(msg.song, Some("桜の木の下で".to_string()));
    assert_eq!(msg.script, Some("\\0\\s[0]プレゼント\\e".to_string()));
}

#[test]
fn test_direct_sstp_and_saori_request() {
    let raw_saori = "EXECUTE SAORI/1.0\r\nModule: internal_crypto\r\nCharset: UTF-8\r\nSender: YAYA\r\nHWnd: 1234\r\nArgument0: Digest\r\nArgument1: sha256\r\nArgument2: test_text\r\n";
    let req = SstpRequest::parse_direct(raw_saori).unwrap();
    assert!(req.is_direct);
    assert!(req.is_saori_request());
    assert_eq!(req.module, Some("internal_crypto".to_string()));
    assert_eq!(req.security_level, Some("local".to_string()));
    assert_eq!(req.hwnd, Some(1234));
    assert_eq!(
        req.references.get("Reference0"),
        Some(&"Digest".to_string())
    );
    assert_eq!(
        req.references.get("Reference1"),
        Some(&"sha256".to_string())
    );
    assert_eq!(
        req.references.get("Reference2"),
        Some(&"test_text".to_string())
    );

    let mut req_no_module = req.clone();
    req_no_module.module = None;
    assert!(req_no_module.is_saori_request());

    req_no_module.version = "SSTP/1.4".to_string();
    assert!(!req_no_module.is_saori_request());
}

#[test]
fn test_sstp_request_parser_more_edge_cases() {
    let raw = "SEND SSTP/1.4\r\n\
        Sender: Tool\r\n\
        SecurityLevel: external\r\n\
        X-SSTP-PassThru-Header1: pass_val\r\n\
        HWnd: invalid_number\r\n\
        ReceiverGhostHWnd: invalid_number\r\n\
        KeepAlive: 1\r\n\
        Option: opt1, , opt2\r\n\
        Argument0: arg_val\r\n\
        \r\n";
    let req = SstpRequest::parse(raw).unwrap();
    assert!(req.keep_alive);
    assert_eq!(req.security_level, Some("external".to_string()));
    assert_eq!(req.pass_thru.get("X-SSTP-PassThru-Header1"), Some(&"pass_val".to_string()));
    assert_eq!(req.hwnd, None);
    assert_eq!(req.receiver_ghost_hwnd, None);
    assert_eq!(req.options, vec!["opt1", "opt2"]);
    assert_eq!(req.references.get("Reference0"), Some(&"arg_val".to_string()));
}

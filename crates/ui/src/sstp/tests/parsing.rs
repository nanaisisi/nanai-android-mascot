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
    assert_eq!(SstpStatusCode::BadRequest.code(), 400);
    assert_eq!(SstpStatusCode::NotFound.code(), 404);
    assert_eq!(SstpStatusCode::Conflict.code(), 409);
    assert_eq!(SstpStatusCode::Break.code(), 210);
    assert_eq!(SstpStatusCode::RequestTimeout.code(), 408);
    assert_eq!(SstpStatusCode::PayloadTooLarge.code(), 413);
    assert_eq!(SstpStatusCode::Refuse.code(), 420);
    assert_eq!(SstpStatusCode::InternalServerError.code(), 500);
    assert_eq!(SstpStatusCode::NotImplemented.code(), 501);
    assert_eq!(SstpStatusCode::ServiceUnavailable.code(), 503);
    assert_eq!(SstpStatusCode::VersionNotSupported.code(), 505);
    assert_eq!(SstpStatusCode::Invisible.code(), 512);
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
}

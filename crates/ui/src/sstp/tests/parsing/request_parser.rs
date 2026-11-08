/**
 * @file request_parser.rs
 * @brief SstpRequest パース・Option フラグ・IfGhost スクリプト選択・SAORI/Direct SSTP 単体テスト
 */
use super::*;

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
    assert_eq!(
        req.pass_thru.get("X-SSTP-PassThru-Header1"),
        Some(&"pass_val".to_string())
    );
    assert_eq!(req.hwnd, None);
    assert_eq!(req.receiver_ghost_hwnd, None);
    assert_eq!(req.options, vec!["opt1", "opt2"]);
    assert_eq!(
        req.references.get("Reference0"),
        Some(&"arg_val".to_string())
    );
}

#[test]
fn test_sstp_http_tunneling_headers_parsing() {
    let raw = "SEND SSTP/1.4\r\n\
        Sender: WebClient\r\n\
        Content-Type: text/plain\r\n\
        User-Agent: Mozilla/5.0 (Android)\r\n\
        Host: 127.0.0.1:9801\r\n\
        Script: \\0Hello from Web\\e\r\n\r\n";
    let req = SstpRequest::parse(raw).unwrap();
    assert_eq!(req.content_type, Some("text/plain".to_string()));
    assert_eq!(req.user_agent, Some("Mozilla/5.0 (Android)".to_string()));
    assert_eq!(req.host, Some("127.0.0.1:9801".to_string()));

    let resp = SstpResponse::ok(Some("\\0Ack\\e".to_string()))
        .with_content_type("text/plain")
        .with_connection("close");
    let built = resp.build();
    assert!(built.contains("Content-Type: text/plain\r\n"));
    assert!(built.contains("Connection: close\r\n"));

    let parsed_resp = SstpResponse::parse(&built).unwrap();
    assert_eq!(parsed_resp.content_type, Some("text/plain".to_string()));
    assert_eq!(parsed_resp.connection_header, Some("close".to_string()));
}

use super::*;

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
fn test_sstp_execute_and_communicate() {
    let raw_exec = "EXECUTE SSTP/1.1\r\nSender: Client\r\nCommand: GetGhostName\r\nHWnd: 12345\r\n";
    let req_exec = SstpRequest::parse(raw_exec).unwrap();
    assert_eq!(req_exec.method, SstpMethod::Execute);
    assert_eq!(req_exec.command, Some("GetGhostName".to_string()));
    assert_eq!(req_exec.hwnd, Some(12345));

    let raw_comm = "COMMUNICATE SSTP/1.2\r\nSender: Emily\r\nSentence: おはよう\r\nReceiverGhostName: Nanai\r\nKeepAlive: 1\r\n";
    let req_comm = SstpRequest::parse(raw_comm).unwrap();
    assert_eq!(req_comm.method, SstpMethod::Communicate);
    assert_eq!(req_comm.sentence, Some("おはよう".to_string()));
    assert_eq!(req_comm.receiver_ghost_name, Some("Nanai".to_string()));
    assert!(req_comm.keep_alive);
}

#[test]
fn test_sstp_response_build() {
    let mut res = SstpResponse::ok(Some("\\0Hi\r\n\\e".to_string()));
    res.references
        .insert("Reference0".to_string(), "Val0".to_string());
    res.pass_thru
        .insert("X-SSTP-PassThru-Custom".to_string(), "Value".to_string());
    let built = res.build();

    assert!(built.starts_with("SSTP/1.4 200 OK\r\n"));
    assert!(built.contains("Charset: UTF-8\r\n"));
    assert!(built.contains("Script: \\0Hi\\e\r\n"));
    assert!(built.contains("Reference0: Val0\r\n"));
    assert!(built.contains("X-SSTP-PassThru-Custom: Value\r\n"));
    assert!(built.ends_with("\r\n\r\n"));

    let mut res_data = SstpResponse::ok(None);
    res_data.additional_data = Some("Nanai,Kero\r\n".to_string());
    let built_data = res_data.build();
    assert!(built_data.contains("\r\n\r\nNanai,Kero\r\n\r\n"));
}

#[test]
fn test_sstp_message_alias_and_give_parsing() {
    let raw_give = "GIVE SSTP/1.1\r\nSender: ExternalClient\r\nScript: \\0\\s[0]プレゼント\\e\r\n";
    let msg: SstpMessage = SstpRequest::parse(raw_give).unwrap();
    assert_eq!(msg.method, SstpMethod::Give);
    assert_eq!(msg.sender, "ExternalClient");
    assert_eq!(msg.script, Some("\\0\\s[0]プレゼント\\e".to_string()));
}

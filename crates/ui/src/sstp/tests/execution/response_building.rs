/**
 * @file response_building.rs
 * @brief SSTP レスポンスヘルパー構築・SSTP イベントビルダー単体テスト
 */

use super::*;

#[test]
fn test_sstp_additional_status_constructors() {
    let res_conflict = SstpResponse::conflict();
    assert_eq!(res_conflict.status, SstpStatusCode::Conflict);
    assert!(res_conflict.build().contains("409 Conflict"));

    let res_refuse = SstpResponse::refuse();
    assert_eq!(res_refuse.status, SstpStatusCode::Refuse);
    assert!(res_refuse.build().contains("420 Refuse"));

    let res_unavailable = SstpResponse::service_unavailable();
    assert_eq!(res_unavailable.status, SstpStatusCode::ServiceUnavailable);
    assert!(res_unavailable.build().contains("503 Service Unavailable"));

    let res_version = SstpResponse::version_not_supported();
    assert_eq!(res_version.status, SstpStatusCode::VersionNotSupported);
    assert!(res_version.build().contains("505 Version Not Supported"));

    let res_payload = SstpResponse::payload_too_large();
    assert_eq!(res_payload.status, SstpStatusCode::PayloadTooLarge);
    assert!(res_payload.build().contains("413 Payload Too Large"));

    let res_invis = SstpResponse::invisible();
    assert_eq!(res_invis.status, SstpStatusCode::Invisible);
    assert!(res_invis.build().contains("512 Invisible"));
}

#[test]
fn test_sstp_execute_and_communicate() {
    let raw_exec = "EXECUTE SSTP/1.1\r\nSender: Client\r\nCommand: GetGhostName\r\nHWnd: 12345\r\n";
    let req_exec = SstpRequest::parse(raw_exec).unwrap();
    assert_eq!(req_exec.method, SstpMethod::Execute);
    assert_eq!(req_exec.command, Some("GetGhostName".to_string()));
    assert_eq!(req_exec.hwnd, Some(12345));

    let raw_comm = "COMMUNICATE SSTP/1.2\r\nSender: Emily\r\nSentence: おはよう\r\nSurface: 0,10\r\nReceiverGhostName: Nanai\r\nKeepAlive: 1\r\n";
    let req_comm = SstpRequest::parse(raw_comm).unwrap();
    assert_eq!(req_comm.method, SstpMethod::Communicate);
    assert_eq!(req_comm.sentence, Some("おはよう".to_string()));
    assert_eq!(req_comm.surface, Some("0,10".to_string()));
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

    // Keep-Alive レスポンスの検証
    let res_keepalive = SstpResponse::ok(None)
        .with_keep_alive(true)
        .with_keep_alive_timeout(5)
        .with_additional_data("1.0.0");
    let built_keepalive = res_keepalive.build();
    assert!(built_keepalive.contains("Connection: keep-alive\r\n"));
    assert!(built_keepalive.contains("Keep-Alive: timeout=5\r\n"));
    assert!(built_keepalive.contains("Content-Length: 5\r\n"));
    assert!(built_keepalive.ends_with("\r\n\r\n1.0.0"));

    // Keep-Alive close レスポンスの検証
    let res_close = SstpResponse::no_content().with_keep_alive(false);
    let built_close = res_close.build();
    assert!(built_close.contains("Connection: close\r\n"));
    assert!(!built_close.contains("Keep-Alive:"));
}

#[test]
fn test_sstp_event_builders() {
    let break_params = SstpEventBuilder::build_on_sstp_break("\\0\\s[0]こんにちは\\e", 0, 12);
    assert_eq!(break_params.get("ID"), Some(&"OnSSTPBreak".to_string()));
    assert_eq!(
        break_params.get("Reference0"),
        Some(&"\\0\\s[0]こんにちは\\e".to_string())
    );
    assert_eq!(break_params.get("Reference1"), Some(&"0".to_string()));
    assert_eq!(break_params.get("Reference2"), Some(&"12".to_string()));

    let black_params = SstpEventBuilder::build_on_sstp_blacklisting("192.168.1.100");
    assert_eq!(
        black_params.get("ID"),
        Some(&"OnSSTPBlacklisting".to_string())
    );
    assert_eq!(
        black_params.get("Reference0"),
        Some(&"192.168.1.100".to_string())
    );
}

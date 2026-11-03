use crate::sstp::*;
use std::collections::HashMap;

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
}

#[test]
fn test_handle_execute_command() {
    let mut properties = HashMap::new();
    properties.insert("ghostlist.count".to_string(), "2".to_string());
    properties.insert("currentghost.name".to_string(), "Nanai Ghost".to_string());

    let mut cookies = HashMap::new();
    let mut client_cookies = HashMap::new();
    client_cookies.insert("user_token".to_string(), "abc123xyz".to_string());
    cookies.insert("ClientApp".to_string(), client_cookies);

    let ctx = SstpGhostContext {
        name: "Nanai Ghost".to_string(),
        sakura_name: "Nanai".to_string(),
        kero_name: "Kero".to_string(),
        shell_name: "master".to_string(),
        balloon_name: "standard".to_string(),
        version: "2.0.0".to_string(),
        short_version: "2.0".to_string(),
        status: "talking".to_string(),
        fmo_text: "ssp_fmo_header_001.name\x01Nanai\r\n".to_string(),
        installed_ghosts: vec!["Nanai".to_string(), "Emily".to_string()],
        installed_shells: vec!["master".to_string(), "winter".to_string()],
        installed_balloons: vec!["standard".to_string(), "retro".to_string()],
        installed_headlines: vec!["News RSS".to_string()],
        installed_plugins: vec!["TTS Plugin".to_string()],
        properties,
        cookies,
        sender: "ClientApp".to_string(),
        sstp_config: SstpGhostConfig::default(),
    };

    let res_getname = handle_execute_command("GetName", &ctx);
    assert_eq!(res_getname.status, SstpStatusCode::Ok);
    assert_eq!(res_getname.additional_data, Some("Nanai,Kero".to_string()));

    let res_getnames = handle_execute_command("GetNames", &ctx);
    assert_eq!(
        res_getnames.additional_data,
        Some("Nanai\r\nEmily".to_string())
    );

    let res_getghost = handle_execute_command("GetGhostName", &ctx);
    assert_eq!(
        res_getghost.additional_data,
        Some("Nanai Ghost".to_string())
    );

    let res_fmo = handle_execute_command("GetFMO", &ctx);
    assert_eq!(
        res_fmo.additional_data,
        Some("ssp_fmo_header_001.name\x01Nanai\r\n".to_string())
    );

    let res_shell = handle_execute_command("GetShellName", &ctx);
    assert_eq!(res_shell.additional_data, Some("master".to_string()));

    let res_balloon = handle_execute_command("GetBalloonName", &ctx);
    assert_eq!(res_balloon.additional_data, Some("standard".to_string()));

    let res_ghost_list = handle_execute_command("GetGhostNameList", &ctx);
    assert_eq!(
        res_ghost_list.additional_data,
        Some("Nanai\r\nEmily".to_string())
    );

    let res_shell_list = handle_execute_command("GetShellNameList", &ctx);
    assert_eq!(
        res_shell_list.additional_data,
        Some("master\r\nwinter".to_string())
    );

    let res_balloon_list = handle_execute_command("GetBalloonNameList", &ctx);
    assert_eq!(
        res_balloon_list.additional_data,
        Some("standard\r\nretro".to_string())
    );

    let res_headline_list = handle_execute_command("GetHeadlineNameList", &ctx);
    assert_eq!(
        res_headline_list.additional_data,
        Some("News RSS".to_string())
    );

    let res_plugin_list = handle_execute_command("GetPluginNameList", &ctx);
    assert_eq!(
        res_plugin_list.additional_data,
        Some("TTS Plugin".to_string())
    );

    let res_prop = handle_execute_command("GetProperty[ghostlist.count]", &ctx);
    assert_eq!(res_prop.status, SstpStatusCode::Ok);
    assert_eq!(res_prop.additional_data, Some("2".to_string()));

    let res_prop_empty = handle_execute_command("GetProperty[]", &ctx);
    assert_eq!(res_prop_empty.status, SstpStatusCode::BadRequest);

    let res_set_prop = handle_execute_command("SetProperty[my.prop,val]", &ctx);
    assert_eq!(res_set_prop.status, SstpStatusCode::Ok);

    let res_set_prop_empty = handle_execute_command("SetProperty[]", &ctx);
    assert_eq!(res_set_prop_empty.status, SstpStatusCode::BadRequest);

    let res_cookie = handle_execute_command("GetCookie[user_token]", &ctx);
    assert_eq!(res_cookie.status, SstpStatusCode::Ok);
    assert_eq!(res_cookie.additional_data, Some("abc123xyz".to_string()));

    let res_cookie_empty = handle_execute_command("GetCookie[]", &ctx);
    assert_eq!(res_cookie_empty.status, SstpStatusCode::BadRequest);

    let res_set_cookie = handle_execute_command("SetCookie[theme,dark]", &ctx);
    assert_eq!(res_set_cookie.status, SstpStatusCode::Ok);

    let res_set_cookie_empty = handle_execute_command("SetCookie[]", &ctx);
    assert_eq!(res_set_cookie_empty.status, SstpStatusCode::BadRequest);

    let res_prop_missing = handle_execute_command("GetProperty[nonexistent.prop]", &ctx);
    assert_eq!(res_prop_missing.status, SstpStatusCode::Ok);
    assert_eq!(res_prop_missing.additional_data, Some("".to_string()));

    let res_prop_lc = handle_execute_command("GetProperty[CURRENTGHOST.NAME]", &ctx);
    assert_eq!(res_prop_lc.status, SstpStatusCode::Ok);
    assert_eq!(res_prop_lc.additional_data, Some("Nanai Ghost".to_string()));

    let res_cookie_missing = handle_execute_command("GetCookie[nonexistent_token]", &ctx);
    assert_eq!(res_cookie_missing.status, SstpStatusCode::Ok);
    assert_eq!(res_cookie_missing.additional_data, Some("".to_string()));

    let mut ctx_other_sender = ctx.clone();
    ctx_other_sender.sender = "UnknownSender".to_string();
    let res_cookie_other = handle_execute_command("GetCookie[user_token]", &ctx_other_sender);
    assert_eq!(res_cookie_other.status, SstpStatusCode::Ok);
    assert_eq!(res_cookie_other.additional_data, Some("".to_string()));

    let res_version = handle_execute_command("GetVersion", &ctx);
    assert_eq!(res_version.additional_data, Some("2.0.0".to_string()));

    let res_shortversion = handle_execute_command("GetShortVersion", &ctx);
    assert_eq!(res_shortversion.additional_data, Some("2.0".to_string()));

    let res_status = handle_execute_command("GetStatus", &ctx);
    assert_eq!(res_status.additional_data, Some("talking".to_string()));

    let mut ctx_empty_status = ctx.clone();
    ctx_empty_status.status.clear();
    let res_empty_status = handle_execute_command("GetStatus", &ctx_empty_status);
    assert!(res_empty_status.additional_data.is_none());

    let res_quiet = handle_execute_command("quiet", &ctx);
    assert_eq!(res_quiet.status, SstpStatusCode::Ok);

    let res_restore = handle_execute_command("restore", &ctx);
    assert_eq!(res_restore.status, SstpStatusCode::Ok);

    let res_unknown = handle_execute_command("InvalidCommand", &ctx);
    assert_eq!(res_unknown.status, SstpStatusCode::BadRequest);
    assert_eq!(
        res_unknown.error_description,
        Some("unknown command".to_string())
    );
}

#[test]
fn test_sstp_ghost_config_from_descript_and_validation() {
    let mut map = HashMap::new();
    map.insert("sstp.allowcommunicate".to_string(), "0".to_string());
    map.insert("sstp.allowunspecifiedsend".to_string(), "0".to_string());
    map.insert("sstp.alwaystranslate".to_string(), "1".to_string());

    let config = SstpGhostConfig::from_descript_map(&map);
    assert!(!config.allow_communicate);
    assert!(!config.allow_unspecified_send);
    assert!(config.always_translate);

    // COMMUNICATE リクエストは拒否される
    let req_comm = SstpRequest::parse("COMMUNICATE SSTP/1.1\r\nSentence: test\r\n").unwrap();
    let res = config.validate_request(&req_comm);
    assert!(res.is_err());
    let err_resp = res.unwrap_err();
    assert_eq!(err_resp.status, SstpStatusCode::Refuse);
    assert_eq!(
        err_resp.error_description,
        Some("COMMUNICATE disabled by ghost".to_string())
    );

    // 無指定 SEND リクエストは拒否される
    let req_send_unspec = SstpRequest::parse("SEND SSTP/1.1\r\nScript: \\0Hi\\e\r\n").unwrap();
    let res_unspec = config.validate_request(&req_send_unspec);
    assert!(res_unspec.is_err());
    assert_eq!(res_unspec.unwrap_err().status, SstpStatusCode::Refuse);

    // ゴースト指定あり SEND リクエストは許可される
    let req_send_spec =
        SstpRequest::parse("SEND SSTP/1.1\r\nReceiverGhostName: Nanai\r\nScript: \\0Hi\\e\r\n")
            .unwrap();
    assert!(config.validate_request(&req_send_spec).is_ok());

    // always_translate による notranslate オプション上書き
    let req_notranslate =
        SstpRequest::parse("SEND SSTP/1.1\r\nOption: notranslate\r\nScript: \\0Hi\\e\r\n").unwrap();
    assert!(config.should_translate(&req_notranslate));

    let default_config = SstpGhostConfig::default();
    assert!(!default_config.should_translate(&req_notranslate));
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

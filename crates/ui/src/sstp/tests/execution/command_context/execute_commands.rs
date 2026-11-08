/**
 * @file execute_commands.rs
 * @brief handle_execute_command による EXECUTE 各種コマンド実行単体テスト
 */

use super::*;

fn create_test_context() -> SstpGhostContext {
    let mut properties = HashMap::new();
    properties.insert("ghostlist.count".to_string(), "2".to_string());
    properties.insert("currentghost.name".to_string(), "Nanai Ghost".to_string());

    let mut cookies = HashMap::new();
    let mut client_cookies = HashMap::new();
    client_cookies.insert("user_token".to_string(), "abc123xyz".to_string());
    cookies.insert("ClientApp".to_string(), client_cookies);

    SstpGhostContext {
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
        security_level: Some("local".to_string()),
        references: HashMap::new(),
    }
}

#[test]
fn test_execute_get_names_and_status_info() {
    let ctx = create_test_context();

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
fn test_execute_property_and_cookie_commands() {
    let ctx = create_test_context();

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

    // Reference によるパラメータ解決
    let mut ctx_ref = ctx.clone();
    ctx_ref
        .references
        .insert("Reference0".to_string(), "currentghost.name".to_string());
    let res_prop_ref = handle_execute_command("GetProperty", &ctx_ref);
    assert_eq!(res_prop_ref.status, SstpStatusCode::Ok);
    assert_eq!(
        res_prop_ref.additional_data,
        Some("Nanai Ghost".to_string())
    );
}

#[test]
fn test_execute_system_and_archive_commands() {
    let ctx = create_test_context();

    assert_eq!(
        handle_execute_command("DumpSurface", &ctx).status,
        SstpStatusCode::Ok
    );
    assert_eq!(
        handle_execute_command("MoveAsync", &ctx).status,
        SstpStatusCode::Ok
    );
    assert_eq!(
        handle_execute_command("SetTrayIcon", &ctx).status,
        SstpStatusCode::Ok
    );
    assert_eq!(
        handle_execute_command("SetTrayBalloon", &ctx).status,
        SstpStatusCode::Ok
    );
    assert_eq!(
        handle_execute_command("CompressArchive[/path/out.zip,/path/in]", &ctx).status,
        SstpStatusCode::Ok
    );
    assert_eq!(
        handle_execute_command("ExtractArchive[/path/in.zip,/path/out]", &ctx).status,
        SstpStatusCode::Ok
    );
    assert_eq!(
        handle_execute_command("CompressArchive[]", &ctx).status,
        SstpStatusCode::BadRequest
    );
}

#[test]
fn test_execute_security_remote_refusal_and_fmo_sanitization() {
    let ctx = create_test_context();

    // リモート呼び出し時の拒否判定 (UKADOC [リモート不可] 規格準拠)
    let mut ctx_remote = ctx.clone();
    ctx_remote.security_level = Some("external".to_string());
    assert_eq!(
        handle_execute_command("Quiet", &ctx_remote).status,
        SstpStatusCode::Refuse
    );
    assert_eq!(
        handle_execute_command("Restore", &ctx_remote).status,
        SstpStatusCode::Refuse
    );
    assert_eq!(
        handle_execute_command("SetProperty[a,b]", &ctx_remote).status,
        SstpStatusCode::Refuse
    );
    assert_eq!(
        handle_execute_command("DumpSurface", &ctx_remote).status,
        SstpStatusCode::Refuse
    );
    assert_eq!(
        handle_execute_command("MoveAsync", &ctx_remote).status,
        SstpStatusCode::Refuse
    );
    assert_eq!(
        handle_execute_command("SetTrayIcon", &ctx_remote).status,
        SstpStatusCode::Refuse
    );
    assert_eq!(
        handle_execute_command("SetTrayBalloon", &ctx_remote).status,
        SstpStatusCode::Refuse
    );
    assert_eq!(
        handle_execute_command("CompressArchive[/a,/b]", &ctx_remote).status,
        SstpStatusCode::Refuse
    );
    assert_eq!(
        handle_execute_command("ExtractArchive[/a,/b]", &ctx_remote).status,
        SstpStatusCode::Refuse
    );

    // GetFMO リモート時のパス情報除去 & ダミーHWND化
    let mut ctx_fmo_remote = ctx;
    ctx_fmo_remote.security_level = Some("external".to_string());
    ctx_fmo_remote.fmo_text = "ssp_fmo_header_001.path\x01/secret/path\r\nssp_fmo_header_001.hwnd\x011234\r\nssp_fmo_header_001.name\x01Nanai\r\nssp_fmo_header_001.ghostpath\x01/secret/ghost\r\n".to_string();
    let res_fmo_remote = handle_execute_command("GetFMO", &ctx_fmo_remote);
    assert_eq!(res_fmo_remote.status, SstpStatusCode::Ok);
    let fmo_out = res_fmo_remote.additional_data.unwrap();
    assert!(!fmo_out.contains(".path\x01"));
    assert!(!fmo_out.contains(".ghostpath\x01"));
    assert!(fmo_out.contains("ssp_fmo_header_001.hwnd\x010"));
    assert!(fmo_out.contains("ssp_fmo_header_001.name\x01Nanai"));
}

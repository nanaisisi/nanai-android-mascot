/**
 * @file names_status.rs
 * @brief GetName, GetGhostName, GetStatus 等の名前・状態取得コマンド単体テスト
 */

use super::*;

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

/**
 * @file security_fmo.rs
 * @brief リモートアクセスのセキュリティ拒否判定および FMO サニタイズ単体テスト
 */
use super::*;

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

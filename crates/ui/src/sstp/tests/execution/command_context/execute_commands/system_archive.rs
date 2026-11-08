/**
 * @file system_archive.rs
 * @brief DumpSurface, MoveAsync, SetTrayIcon, CompressArchive, ExtractArchive 単体テスト
 */

use super::*;

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

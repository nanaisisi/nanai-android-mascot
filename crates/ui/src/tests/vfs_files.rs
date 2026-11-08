/**
 * @file vfs_files.rs
 * @brief Shift_JIS ファイル読み込みおよびパス検証テスト
 */

use super::*;

#[test]
fn test_open_shift_jis_file() {
    let path = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../assets/ghost/mock_nanai/install.txt"
    );
    let content = open_shift_jis_file(path).unwrap();
    assert!(!content.is_empty());
}

#[test]
fn test_archive_entry_path_drive_letter_and_traversal() {
    use crate::update::validate_archive_entry_path;

    assert!(validate_archive_entry_path("ghost/master/aya.dll").is_ok());
    assert!(validate_archive_entry_path("shell/master/surface0.png").is_ok());

    assert!(validate_archive_entry_path("C:/evil.txt").is_err());
    assert!(validate_archive_entry_path("d:\\windows\\system32").is_err());
    assert!(validate_archive_entry_path("z:/path").is_err());

    assert!(validate_archive_entry_path("../traversal.txt").is_err());
    assert!(validate_archive_entry_path("/etc/passwd").is_err());
    assert!(validate_archive_entry_path("").is_err());
    assert!(validate_archive_entry_path("   ").is_err());
}

/**
 * @file validation.rs
 * @brief Zip-slip パストラバーサル防止・アーカイブパス検証単体テスト
 */
use super::*;

#[test]
fn test_validate_archive_entry_path() {
    let engine = StandardInstallerEngine;

    // Valid paths
    assert!(
        engine
            .validate_entry_path("ghost/master/descript.txt")
            .is_ok()
    );
    assert!(
        engine
            .validate_entry_path("shell/master/surface0.png")
            .is_ok()
    );
    assert!(engine.validate_entry_path("readme.txt").is_ok());
    assert!(
        engine
            .validate_entry_path("nested\\sub\\dir\\file.txt")
            .is_ok()
    );

    // Invalid paths (Zip-slip / path traversal)
    assert!(engine.validate_entry_path("../evil.txt").is_err());
    assert!(
        engine
            .validate_entry_path("ghost/../../etc/passwd")
            .is_err()
    );
    assert!(engine.validate_entry_path("shell/../foo").is_err());
    assert!(engine.validate_entry_path("/absolute/path").is_err());
    assert!(engine.validate_entry_path("C:/foo").is_err());
    assert!(engine.validate_entry_path("d:\\bar").is_err());
    assert!(engine.validate_entry_path("\\absolute\\win").is_err());
    assert!(engine.validate_entry_path("foo\0bar.txt").is_err());
    assert!(engine.validate_entry_path("").is_err());
    assert!(engine.validate_entry_path("   ").is_err());
    assert!(engine.validate_entry_path("foo/bar").is_ok());
}

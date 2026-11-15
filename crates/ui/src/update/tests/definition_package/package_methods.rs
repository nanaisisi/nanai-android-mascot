//! UpdatePackage メソッド、フィルタリング、整合性検証、更新差分計画テスト

use super::super::*;

#[test]
fn test_update_package_methods() {
    let content = "file,ghost/master/aya.dll,11223344556677889900aabbccddeeff,size=1000\r\n\
                   file,ghost/master/old.txt,11223344556677889900aabbccddeeff,delete\r\n\
                   file,ghost/master/skip.png,11223344556677889900aabbccddeeff,ignore,size=500\r\n\
                   file,ghost/master/readme.txt,11223344556677889900aabbccddeeff,size=200\r\n";
    let pkg = UpdatePackage::from_definition(content);
    assert_eq!(pkg.entries().len(), 4);

    let required = pkg.active_downloads();
    assert_eq!(required.len(), 2);
    assert_eq!(required[0].path(), "ghost/master/aya.dll");
    assert_eq!(required[1].path(), "ghost/master/readme.txt");

    let deletions = pkg.deletions();
    assert_eq!(deletions.len(), 1);
    assert_eq!(deletions[0].path(), "ghost/master/old.txt");

    assert_eq!(pkg.total_download_size(), 1200);

    assert!(pkg.find_entry("ghost/master/aya.dll").is_some());
    assert!(pkg.find_entry("ghost\\master\\aya.dll").is_some());
    assert!(pkg.find_entry("ghost/master/non_existent.txt").is_none());
}

#[test]
fn test_update_package_noupdate_filter_and_integrity() {
    let content = "file,ghost/master/aya.dll,11223344556677889900aabbccddeeff,size=1000\r\n\
                   file,ghost/master/dev.log,11223344556677889900aabbccddeeff\r\n\
                   file,ghost/master/sub/debug.tmp,11223344556677889900aabbccddeeff\r\n";
    let pkg = UpdatePackage::from_definition(content);
    assert_eq!(pkg.entries().len(), 3);
    assert!(pkg.validate_entries_integrity().is_ok());

    let patterns = ["ghost/master/dev.log", "debug.tmp"];
    let filtered = pkg.filter_noupdate(&patterns);
    assert_eq!(filtered.len(), 1);
    assert_eq!(filtered[0].path(), "ghost/master/aya.dll");

    let bad_hash_pkg = UpdatePackage::from_definition(
        "file,foo.txt,short_hash\r\n"
    );
    assert!(bad_hash_pkg.validate_entries_integrity().is_err());

    let non_hex_pkg = UpdatePackage::from_definition(
        "file,foo.txt,11223344556677889900aabbccddeefz\r\n"
    );
    assert!(non_hex_pkg.validate_entries_integrity().is_err());

    let empty_path_pkg = UpdatePackage::from_definition(
        "file,,11223344556677889900aabbccddeeff\r\n"
    );
    assert!(empty_path_pkg.validate_entries_integrity().is_ok());
}

#[test]
fn test_update_package_progress_summary_and_plan() {
    let content = "file,ghost/master/aya.dll,11223344556677889900aabbccddeeff,size=1000\r\n\
                   file,ghost/master/readme.txt,22334455667788990011aabbccddeeff,size=200\r\n\
                   file,ghost/master/old.log,33445566778899001122aabbccddeeff,delete\r\n\
                   file,ghost/master/custom.ini,44556677889900112233aabbccddeeff,ignore\r\n";
    let pkg = UpdatePackage::from_definition(content);

    let sum0 = pkg.progress_summary(0);
    assert_eq!(sum0.total_entries(), 4);
    assert_eq!(sum0.active_downloads(), 2);
    assert_eq!(sum0.completed_entries(), 0);
    assert_eq!(sum0.deletions(), 1);
    assert_eq!(sum0.total_bytes(), 1200);
    assert!(!sum0.is_finished());

    let sum1 = pkg.progress_summary(1);
    assert_eq!(sum1.completed_entries(), 1);
    assert!(!sum1.is_finished());

    let sum2 = pkg.progress_summary(2);
    assert_eq!(sum2.completed_entries(), 2);
    assert!(sum2.is_finished());

    let sum_over = pkg.progress_summary(10);
    assert_eq!(sum_over.completed_entries(), 2);
    assert!(sum_over.is_finished());

    let mut local_checksums = std::collections::HashMap::new();
    local_checksums.insert(
        "ghost/master/aya.dll".to_string(),
        "11223344556677889900aabbccddeeff".to_string(),
    );
    local_checksums.insert(
        "ghost/master/readme.txt".to_string(),
        "00000000000000000000000000000000".to_string(),
    );

    let plan = pkg.plan_update(&local_checksums);
    assert_eq!(plan.modifications().len(), 1);
    assert_eq!(plan.modifications()[0].path(), "ghost/master/readme.txt");
    assert_eq!(plan.deletions().len(), 1);
    assert_eq!(plan.deletions()[0].path(), "ghost/master/old.log");
    assert_eq!(plan.unchanged().len(), 2);
    assert!(plan.additions().is_empty());
    assert_eq!(plan.total_changes(), 2);
    assert!(plan.has_changes());

    let manifest = InstallManifest::default();
    assert_eq!(manifest.normalized_install_type(), "");
}

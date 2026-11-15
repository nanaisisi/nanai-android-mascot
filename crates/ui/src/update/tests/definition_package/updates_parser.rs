//! updates.txt / updates2.dau テキスト定義のパース処理テスト

use super::super::*;

#[test]
fn test_parse_updates2_dau_byte1_delimited() {
    let content = "ghost\\master\\descript.txt\x011A2B3C4D5E6F7890ABCDEF1234567890\x01size=1024\x01date=2024-01-15T12:34:56\x01charset=Shift_JIS\x01\r\n\
                   ghost\\master\\shiori.dll\x01FEDCBA09876543210987654321ABCDEF\r\n";
    let entries = parse_update_definition(content);
    assert_eq!(entries.len(), 2);

    assert_eq!(entries[0].path(), "ghost/master/descript.txt");
    assert_eq!(entries[0].md5(), "1a2b3c4d5e6f7890abcdef1234567890");
    assert_eq!(entries[0].size(), Some(1024));
    assert_eq!(entries[0].date(), Some("2024-01-15T12:34:56"));
    assert!(!entries[0].is_delete_flag());
    assert!(!entries[0].is_ignore_flag());
    assert!(!entries[0].is_readonly_flag());
    assert!(entries[0].flags().is_empty());

    assert_eq!(entries[1].path(), "ghost/master/shiori.dll");
    assert_eq!(entries[1].md5(), "fedcba09876543210987654321abcdef");
    assert_eq!(entries[1].size(), None);
    assert_eq!(entries[1].date(), None);
    assert!(entries[1].flags().is_empty());
}

#[test]
fn test_parse_updates_txt_comma_delimited() {
    let content = "charset,UTF-8\r\n\
                   file,ghost/master/descript.txt,1a2b3c4d5e6f7890abcdef1234567890,size=2048,date=2025-02-01\r\n\
                   file,ghost\\master\\readme.txt,ABCDEF1234567890ABCDEF1234567890,readonly\r\n";
    let entries = parse_update_definition(content);
    assert_eq!(entries.len(), 2);

    assert_eq!(entries[0].path(), "ghost/master/descript.txt");
    assert_eq!(entries[0].md5(), "1a2b3c4d5e6f7890abcdef1234567890");
    assert_eq!(entries[0].size(), Some(2048));
    assert_eq!(entries[0].date(), Some("2025-02-01"));
    assert!(!entries[0].is_readonly_flag());
    assert!(entries[0].flags().is_empty());

    assert_eq!(entries[1].path(), "ghost/master/readme.txt");
    assert_eq!(entries[1].md5(), "abcdef1234567890abcdef1234567890");
    assert_eq!(entries[1].size(), None);
    assert_eq!(entries[1].date(), None);
    assert!(entries[1].is_readonly_flag());
    assert_eq!(entries[1].flags(), vec!["readonly"]);
}

#[test]
fn test_parse_update_definition_edge_cases() {
    let content = "\r\n  \r\n\t\r\n";
    let entries = parse_update_definition(content);
    assert!(entries.is_empty());

    let content = "charset,Shift_JIS\r\n";
    let entries = parse_update_definition(content);
    assert!(entries.is_empty());

    let content = "file,ghost/master/descript.txt\r\n";
    let entries = parse_update_definition(content);
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0].path(), "ghost/master/descript.txt");
    assert_eq!(entries[0].md5(), "");
    assert_eq!(entries[0].size(), None);
    assert_eq!(entries[0].date(), None);

    let content = "file,,1a2b3c4d5e6f7890abcdef1234567890\r\n";
    let entries = parse_update_definition(content);
    assert!(entries.is_empty());

    let content = "shell/default/surface0.png\x0100112233445566778899aabbccddeeff\x01foo=bar\x01size=512\x01date=2026-10-31\x01ignore\x01readonly\x01delete\x01baz=qux\r\n";
    let entries = parse_update_definition(content);
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0].path(), "shell/default/surface0.png");
    assert_eq!(entries[0].md5(), "00112233445566778899aabbccddeeff");
    assert_eq!(entries[0].size(), Some(512));
    assert!(entries[0].is_ignore_flag());
    assert!(entries[0].is_readonly_flag());
    assert!(entries[0].is_delete_flag());
    assert_eq!(entries[0].date(), Some("2026-10-31"));
    assert_eq!(entries[0].flags(), vec!["ignore", "readonly", "delete"]);
    assert!(entries[0].is_ignore());
    assert!(entries[0].is_readonly());
    assert!(entries[0].is_delete());
}

#[test]
fn test_update_parser_more_edge_cases() {
    let install_txt = "\
# comment line\n\
// another comment\n\
name:ColonGhost\n\
balloon.directory:my_balloon\n\
oninstallscript,\\0Hello\\e\n\
onuninstallscript,\\0Bye\\e\n\
refreshundeletemask,save.dat::user.ini\n\
balloon0.directory,balloon_a\n\
balloon0.refresh,1\n\
balloon0.refreshundeletemask,pref1.txt\n\
balloon1.directory,balloon_b\n\
balloon1.refresh,0\n\
";
    let manifest = parse_install_manifest(install_txt);
    assert_eq!(manifest.name(), "ColonGhost");
    assert_eq!(manifest.oninstall_script(), Some("\\0Hello\\e"));
    assert_eq!(manifest.onuninstall_script(), Some("\\0Bye\\e"));
    assert_eq!(manifest.refresh_undelete_mask(), &["save.dat", "user.ini"]);
    assert_eq!(manifest.bundled_resources().len(), 3);

    let update_txt =
        "charset,UTF-8\r\nfile,test.txt,md5,charset=UTF-8,size=100,size=not_a_number\r\n";
    let entries = parse_update_definition(update_txt);
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0].size(), Some(100));
}

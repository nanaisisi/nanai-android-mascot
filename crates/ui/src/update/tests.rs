use super::*;

#[test]
fn test_parse_updates2_dau_byte1_delimited() {
    let content = "ghost\\master\\descript.txt\x011A2B3C4D5E6F7890ABCDEF1234567890\x01size=1024\x01date=2024-01-15T12:34:56\x01charset=Shift_JIS\x01\r\n\
                   ghost\\master\\shiori.dll\x01FEDCBA09876543210987654321ABCDEF\r\n";
    let entries = parse_update_definition(content);
    assert_eq!(entries.len(), 2);

    assert_eq!(entries[0].path, "ghost/master/descript.txt");
    assert_eq!(entries[0].md5, "1a2b3c4d5e6f7890abcdef1234567890");
    assert_eq!(entries[0].size, Some(1024));
    assert_eq!(entries[0].date, Some("2024-01-15T12:34:56".to_string()));
    assert!(!entries[0].is_delete);
    assert!(!entries[0].is_ignore);
    assert!(!entries[0].is_readonly);
    assert!(entries[0].flags.is_empty());

    assert_eq!(entries[1].path, "ghost/master/shiori.dll");
    assert_eq!(entries[1].md5, "fedcba09876543210987654321abcdef");
    assert_eq!(entries[1].size, None);
    assert_eq!(entries[1].date, None);
    assert!(entries[1].flags.is_empty());
}

#[test]
fn test_parse_updates_txt_comma_delimited() {
    let content = "charset,UTF-8\r\n\
                   file,ghost/master/descript.txt,1a2b3c4d5e6f7890abcdef1234567890,size=2048,date=2025-02-01\r\n\
                   file,ghost\\master\\readme.txt,ABCDEF1234567890ABCDEF1234567890,readonly\r\n";
    let entries = parse_update_definition(content);
    assert_eq!(entries.len(), 2);

    assert_eq!(entries[0].path, "ghost/master/descript.txt");
    assert_eq!(entries[0].md5, "1a2b3c4d5e6f7890abcdef1234567890");
    assert_eq!(entries[0].size, Some(2048));
    assert_eq!(entries[0].date, Some("2025-02-01".to_string()));
    assert!(!entries[0].is_readonly);
    assert!(entries[0].flags.is_empty());

    assert_eq!(entries[1].path, "ghost/master/readme.txt");
    assert_eq!(entries[1].md5, "abcdef1234567890abcdef1234567890");
    assert_eq!(entries[1].size, None);
    assert_eq!(entries[1].date, None);
    assert!(entries[1].is_readonly);
    assert_eq!(entries[1].flags, vec!["readonly"]);
}

#[test]
fn test_parse_update_definition_edge_cases() {
    // Empty and blank lines
    let content = "\r\n  \r\n\t\r\n";
    let entries = parse_update_definition(content);
    assert!(entries.is_empty());

    // Line with charset only
    let content = "charset,Shift_JIS\r\n";
    let entries = parse_update_definition(content);
    assert!(entries.is_empty());

    // File entry without MD5
    let content = "file,ghost/master/descript.txt\r\n";
    let entries = parse_update_definition(content);
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0].path, "ghost/master/descript.txt");
    assert_eq!(entries[0].md5, "");
    assert_eq!(entries[0].size, None);
    assert_eq!(entries[0].date, None);

    // Entry with empty path after trimming
    let content = "file,,1a2b3c4d5e6f7890abcdef1234567890\r\n";
    let entries = parse_update_definition(content);
    assert!(entries.is_empty());

    // Extra unknown key-value pairs along with size, date and option flags (ignore, readonly, delete)
    let content = "shell/default/surface0.png\x0100112233445566778899aabbccddeeff\x01foo=bar\x01size=512\x01date=2026-10-31\x01ignore\x01readonly\x01delete\x01baz=qux\r\n";
    let entries = parse_update_definition(content);
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0].path, "shell/default/surface0.png");
    assert_eq!(entries[0].md5, "00112233445566778899aabbccddeeff");
    assert_eq!(entries[0].size, Some(512));
    assert!(entries[0].is_ignore);
    assert!(entries[0].is_readonly);
    assert!(entries[0].is_delete);
    assert_eq!(entries[0].date, Some("2026-10-31".to_string()));
    assert_eq!(entries[0].flags, vec!["ignore", "readonly", "delete"]);
    assert!(entries[0].is_ignore());
    assert!(entries[0].is_readonly());
    assert!(entries[0].is_delete());
}

#[test]
fn test_update_package_methods() {
    let content = "file,ghost/master/aya.dll,11223344556677889900aabbccddeeff,size=1000\r\n\
                   file,ghost/master/old.txt,11223344556677889900aabbccddeeff,delete\r\n\
                   file,ghost/master/skip.png,11223344556677889900aabbccddeeff,ignore,size=500\r\n\
                   file,ghost/master/readme.txt,11223344556677889900aabbccddeeff,size=200\r\n";
    let pkg = UpdatePackage::from_definition(content);
    assert_eq!(pkg.entries.len(), 4);

    let active = pkg.active_downloads();
    assert_eq!(active.len(), 2);
    assert_eq!(active[0].path, "ghost/master/aya.dll");
    assert_eq!(active[1].path, "ghost/master/readme.txt");

    let deletions = pkg.deletions();
    assert_eq!(deletions.len(), 1);
    assert_eq!(deletions[0].path, "ghost/master/old.txt");

    assert_eq!(pkg.total_download_size(), 1200);

    assert!(pkg.find_entry("ghost\\master\\aya.dll").is_some());
    assert!(pkg.find_entry("ghost/master/nonexistent.txt").is_none());
}

#[test]
fn test_installer_engine_and_manifest_parsing() {
    let install_txt = "\
charset,UTF-8\r\n\
type,package\r\n\
name,MySpecialPackage\r\n\
directory,special_ghost\r\n\
accept,Nanai,Mini\r\n\
bootghost,special_ghost\r\n\
refresh,1\r\n\
refreshundeletemask,save.dat:user.ini\r\n\
balloon.directory,my_balloon\r\n\
balloon.refresh,1\r\n\
balloon.refreshundeletemask,balloon_pref.txt\r\n\
shell0.directory,my_shell\r\n\
shell0.source.directory,custom_shell\r\n";

    let engine = StandardInstallerEngine;
    let manifest = engine.parse_install_manifest(install_txt);

    assert_eq!(manifest.name, "MySpecialPackage");
    assert_eq!(manifest.install_type, "package");
    assert_eq!(manifest.directory.as_deref(), Some("special_ghost"));
    assert_eq!(manifest.effective_directory(), "special_ghost");
    assert_eq!(manifest.charset.as_deref(), Some("UTF-8"));
    assert_eq!(manifest.accept.as_deref(), Some("Nanai,Mini"));
    assert_eq!(manifest.bootghost.as_deref(), Some("special_ghost"));
    assert!(manifest.refresh);
    assert_eq!(manifest.refresh_undelete_mask, vec!["save.dat", "user.ini"]);

    assert!(manifest.is_refresh_protected("save.dat"));
    assert!(manifest.is_refresh_protected("SAVE.DAT"));
    assert!(manifest.is_refresh_protected("user.ini"));
    assert!(!manifest.is_refresh_protected("ghost.dll"));

    // Accept and refusal evaluation
    assert!(manifest.is_acceptable_by("Nanai"));
    assert!(manifest.is_acceptable_by("mini"));
    assert!(!manifest.is_acceptable_by("OtherGhost"));
    assert_eq!(manifest.evaluate_refusal("Nanai"), None);
    assert_eq!(
        manifest.evaluate_refusal("OtherGhost"),
        Some("accept failed")
    );

    assert_eq!(manifest.bundled_resources.len(), 2);
    assert_eq!(manifest.bundled_resources[0].resource_type, "balloon");
    assert_eq!(manifest.bundled_resources[0].target_directory, "my_balloon");
    assert!(manifest.bundled_resources[0].refresh);
    assert_eq!(
        manifest.bundled_resources[0].refresh_undelete_mask,
        vec!["balloon_pref.txt"]
    );

    assert_eq!(manifest.bundled_resources[1].resource_type, "shell");
    assert_eq!(manifest.bundled_resources[1].target_directory, "my_shell");
    assert_eq!(
        manifest.bundled_resources[1].source_directory,
        "custom_shell"
    );
    assert!(!manifest.bundled_resources[1].refresh);

    let files = vec![
        "ghost/master/ghost.dll".to_string(),
        "ghost/master/save.dat".to_string(),
        "readme.txt".to_string(),
    ];
    let to_delete = engine.filter_refresh_deletions(&files, &manifest);
    assert_eq!(to_delete.len(), 2);
    assert_eq!(to_delete[0], "ghost/master/ghost.dll");
    assert_eq!(to_delete[1], "readme.txt");
}

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
    assert!(engine.validate_entry_path("").is_err());
    assert!(engine.validate_entry_path("foo/bar").is_ok());
}

#[test]
fn test_installer_engine_extended_directives() {
    let install_txt = "\
name,ExtendedGhost\r\n\
type,ghost\r\n\
directory,ext_ghost\r\n\
notice,Please confirm the terms of use.\r\n\
readme,readme_jp.txt\r\n\
execute,setup.exe\r\n\
oninstall.script,\\0\\s[0]インストールが完了しました。\\e\r\n\
onuninstall.script,\\0\\s[0]アンインストールしました。\\e\r\n";

    let engine = StandardInstallerEngine;
    let manifest = engine.parse_install_manifest(install_txt);

    assert_eq!(manifest.name, "ExtendedGhost");
    assert_eq!(
        manifest.notice.as_deref(),
        Some("Please confirm the terms of use.")
    );
    assert_eq!(manifest.readme.as_deref(), Some("readme_jp.txt"));
    assert_eq!(manifest.execute.as_deref(), Some("setup.exe"));
    assert_eq!(
        manifest.oninstall_script.as_deref(),
        Some("\\0\\s[0]インストールが完了しました。\\e")
    );
    assert_eq!(
        manifest.onuninstall_script.as_deref(),
        Some("\\0\\s[0]アンインストールしました。\\e")
    );
    assert_eq!(manifest.evaluate_refusal("AnyGhost"), None);

    let empty_name_manifest = InstallManifest {
        name: "".to_string(),
        ..Default::default()
    };
    assert_eq!(
        empty_name_manifest.evaluate_refusal("AnyGhost"),
        Some("invalid name")
    );
}

#[test]
fn test_installer_engine_edge_cases() {
    let install_txt = "name,NoRefresh\nrefresh,0\n";
    let engine = StandardInstallerEngine;
    let manifest = engine.parse_install_manifest(install_txt);
    let files = vec!["ghost.dll".to_string(), "save.dat".to_string()];
    let filtered = engine.filter_refresh_deletions(&files, &manifest);
    assert!(filtered.is_empty());

    let manifest_ref = engine.parse_install_manifest("name,Refresh\nrefresh,1\n");
    let files_edge = vec!["".to_string(), "/".to_string(), "ghost.dll".to_string()];
    let filtered_edge = engine.filter_refresh_deletions(&files_edge, &manifest_ref);
    assert!(!filtered_edge.is_empty());
}

#[test]
fn test_update_parser_more_edge_cases() {
    let install_txt = "\
# comment line\n\
// another comment\n\
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
    assert_eq!(manifest.oninstall_script.as_deref(), Some("\\0Hello\\e"));
    assert_eq!(manifest.onuninstall_script.as_deref(), Some("\\0Bye\\e"));
    assert_eq!(manifest.refresh_undelete_mask, vec!["save.dat", "user.ini"]);
    assert_eq!(manifest.bundled_resources.len(), 2);
    assert_eq!(manifest.bundled_resources[0].target_directory, "balloon_a");
    assert!(manifest.bundled_resources[0].refresh);
    assert_eq!(manifest.bundled_resources[1].target_directory, "balloon_b");
    assert!(!manifest.bundled_resources[1].refresh);

    let update_txt = "charset,UTF-8\r\nfile,test.txt,md5,charset=UTF-8,size=100\r\n";
    let entries = parse_update_definition(update_txt);
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0].size, Some(100));
}

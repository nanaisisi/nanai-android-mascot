/**
 * @file installer_manifest.rs
 * @brief install.txt マニフェスト・InstallerEngine・開発者オプション単体テスト
 */

use super::*;

#[test]
fn test_install_manifest_install_accept_alias_and_multi_install() {
    let install_txt = "name,MultiGhost\r\n\
                       accept,Nanai,master\r\n";
    let manifest = parse_install_manifest(install_txt);
    assert_eq!(manifest.name, "MultiGhost");
    assert!(manifest.is_acceptable_by("Nanai"));
    assert!(manifest.is_acceptable_by("master"));
    assert!(!manifest.is_acceptable_by("other"));
    assert!(!manifest.is_multi_install());
    assert_eq!(manifest.all_target_directories(), vec!["MultiGhost"]);
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
    assert!(manifest.is_multi_install());
    assert_eq!(
        manifest.all_target_directories(),
        vec!["special_ghost", "my_balloon", "my_shell"]
    );
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
fn test_parse_install_manifest_malformed_lines() {
    let install_txt = "\
,missing_key\n\
missing_value,\n\
name,Test\n\
";
    let manifest = parse_install_manifest(install_txt);
    assert_eq!(manifest.name, "Test");
}

#[test]
fn test_parse_install_manifest_empty() {
    let manifest = parse_install_manifest("");
    assert!(manifest.name.is_empty());
}

#[test]
fn test_parse_developer_options() {
    let content = "\
# Developer options comment\r\n\
// another comment\r\n\
noupdate=ghost/master/dev.log\r\n\
noupdate,ghost/master/temp.bin\r\n\
noupdate: debug.dat\r\n\
other_key=ignore_me\r\n\
";
    let noupdate_files = crate::update::parser::parse_developer_options(content);
    assert_eq!(noupdate_files.len(), 3);
    assert_eq!(noupdate_files[0], "ghost/master/dev.log");
    assert_eq!(noupdate_files[1], "ghost/master/temp.bin");
    assert_eq!(noupdate_files[2], "debug.dat");

    let engine = StandardInstallerEngine;
    let engine_files = engine.parse_developer_options(content);
    assert_eq!(engine_files, noupdate_files);
}

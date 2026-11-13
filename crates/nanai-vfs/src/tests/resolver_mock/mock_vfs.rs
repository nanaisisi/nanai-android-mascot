/**
 * @file mock_vfs.rs
 * @brief インメモリ仮想ファイルシステム MockVfs 単体テスト
 */
use super::*;

#[test]
fn test_mock_vfs() {
    let mut mock = MockVfs::new();
    assert!(mock.is_empty());
    assert_eq!(mock.len(), 0);

    // Add binary and text
    mock.add_file("ghost/master/aya.dll", vec![1, 2, 3, 4]);

    let (sjis_bytes, _, _) = SHIFT_JIS.encode("charset,Shift_JIS\r\nname,モック");
    mock.add_file("GHOST/MASTER/descript.txt", sjis_bytes.into_owned());

    mock.add_text_file("ghost/master/readme.txt", "Read me text");

    assert_eq!(mock.len(), 3);
    assert!(!mock.is_empty());

    // exists (大小文字・セパレータ不問)
    assert!(mock.exists("ghost/master/aya.dll"));
    assert!(mock.exists("GHOST\\MASTER\\AYA.DLL"));
    assert!(mock.exists("./ghost/master/descript.txt"));
    assert!(mock.exists("ghost/master/readme.txt"));
    assert!(!mock.exists("ghost/master/nonexistent.txt"));

    // read_binary
    assert_eq!(
        mock.read_binary("GHOST/master/aya.dll").unwrap(),
        vec![1, 2, 3, 4]
    );
    assert!(mock.read_binary("nonexistent.bin").is_err());

    // read_text (Shift_JIS auto-decode)
    let desc = mock.read_text("ghost/master/descript.txt").unwrap();
    assert!(desc.contains("name,モック"));
    assert!(mock.read_text("nonexistent_text.txt").is_err());

    // list_dir
    let root_list = mock.list_dir("");
    assert_eq!(root_list, vec!["ghost".to_string()]);

    let master_list = mock.list_dir("ghost/master");
    assert_eq!(
        master_list,
        vec![
            "aya.dll".to_string(),
            "descript.txt".to_string(),
            "readme.txt".to_string(),
        ]
    );

    mock.add_file("test.bin", vec![99]);
    let vfs: &dyn VirtualFileSystem = &mock;
    assert_eq!(vfs.read_binary("test.bin").unwrap(), vec![99]);

    // remove_file
    assert!(mock.remove_file("GHOST/MASTER/AYA.DLL"));
    assert!(!mock.exists("ghost/master/aya.dll"));
    assert_eq!(mock.len(), 3);

    // clear
    mock.clear();
    assert!(mock.is_empty());
    assert_eq!(mock.len(), 0);
}

#[test]
fn test_mock_vfs_walk_filter_and_total_bytes() {
    let mut mock = MockVfs::new();
    mock.add_text_file("ghost/master/descript.txt", "name,Ghost");
    mock.add_text_file("ghost/master/shiori.dll", "mock-binary");
    mock.add_text_file("shell/master/descript.txt", "name,Shell");
    mock.add_text_file("shell/master/surface0000.png", "png-content");
    mock.add_text_file("shell/master/surface0001.png", "png-content-2");

    // walk_dir
    let all_files = mock.walk_dir("");
    assert_eq!(all_files.len(), 5);

    let shell_files = mock.walk_dir("shell");
    assert_eq!(
        shell_files,
        vec![
            "shell/master/descript.txt".to_string(),
            "shell/master/surface0000.png".to_string(),
            "shell/master/surface0001.png".to_string(),
        ]
    );

    let master_shell_files = mock.walk_dir("shell/master");
    assert_eq!(master_shell_files.len(), 3);

    // filter_by_extension
    let pngs = mock.filter_by_extension("png");
    assert_eq!(
        pngs,
        vec![
            "shell/master/surface0000.png".to_string(),
            "shell/master/surface0001.png".to_string(),
        ]
    );

    let txts = mock.filter_by_extension(".txt");
    assert_eq!(
        txts,
        vec![
            "ghost/master/descript.txt".to_string(),
            "shell/master/descript.txt".to_string(),
        ]
    );

    // total_bytes
    let expected_bytes = "name,Ghost".len()
        + "mock-binary".len()
        + "name,Shell".len()
        + "png-content".len()
        + "png-content-2".len();
    assert_eq!(mock.total_bytes(), expected_bytes);
}

#[test]
fn test_mock_vfs_remove_dir_and_find_files() {
    let mut mock = MockVfs::new();
    mock.add_text_file("ghost/master/descript.txt", "name,Ghost");
    mock.add_text_file("ghost/master/shiori.dll", "mock-dll");
    mock.add_text_file("shell/master/descript.txt", "name,Shell");
    mock.add_text_file("shell/master/surface0000.png", "img-0");
    mock.add_text_file("shell/master/surface0001.png", "img-1");
    mock.add_text_file("shell/variant/descript.txt", "name,Variant");

    // find_files
    let surfaces = mock.find_files("surface");
    assert_eq!(
        surfaces,
        vec![
            "shell/master/surface0000.png".to_string(),
            "shell/master/surface0001.png".to_string(),
        ]
    );

    let descs = mock.find_files("DESCRIPT");
    assert_eq!(
        descs,
        vec![
            "ghost/master/descript.txt".to_string(),
            "shell/master/descript.txt".to_string(),
            "shell/variant/descript.txt".to_string(),
        ]
    );

    // remove_dir (shell/master 配下の3ファイルを一括削除)
    let removed = mock.remove_dir("shell/master");
    assert_eq!(removed, 3);
    assert_eq!(mock.len(), 3);
    assert!(!mock.exists("shell/master/surface0000.png"));
    assert!(mock.exists("shell/variant/descript.txt"));

    // remove_dir (全クリア)
    let removed_all = mock.remove_dir("");
    assert_eq!(removed_all, 3);
    assert!(mock.is_empty());

    // remove_file
    let mut mock2 = MockVfs::new();
    mock2.add_text_file("test.txt", "content");
    assert!(mock2.remove_file("test.txt"));
    assert!(!mock2.remove_file("nonexistent.txt"));
}

#[test]
fn test_mock_vfs_extended_resolver_operations() {
    let mut mock = MockVfs::new();
    assert!(!mock.has_dir(""));
    assert_eq!(mock.remove_dir(""), 0);

    mock.add_text_file("ghost/master/desc.txt", "desc");
    mock.add_text_file("ghost/master/surface.png", "png");
    mock.add_text_file("other/readme.txt", "readme");

    assert!(mock.has_dir("ghost"));
    assert!(mock.has_dir(""));

    assert!(!mock.copy_file("nonexistent.txt", "dst.txt"));
    assert!(!mock.rename_file("nonexistent.txt", "dst.txt"));

    assert!(mock.copy_file("ghost/master/desc.txt", "ghost/master/desc_copy.txt"));
    assert!(mock.exists("ghost/master/desc_copy.txt"));

    assert!(mock.rename_file(
        "ghost/master/desc_copy.txt",
        "ghost/master/desc_renamed.txt"
    ));
    assert!(!mock.exists("ghost/master/desc_copy.txt"));
    assert!(mock.exists("ghost/master/desc_renamed.txt"));

    let txt_files = mock.filter_by_extension(".txt");
    assert_eq!(txt_files.len(), 3);

    let found = mock.find_files("desc_renamed.txt");
    assert_eq!(found.len(), 1);

    assert!(mock.total_bytes() > 0);

    let removed = mock.remove_dir("other");
    assert_eq!(removed, 1);
    assert!(!mock.exists("other/readme.txt"));

    let removed_all = mock.remove_dir("");
    assert_eq!(removed_all, 3);
    assert!(mock.is_empty());
}

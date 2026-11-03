use super::super::*;
use encoding_rs::SHIFT_JIS;

#[test]
fn test_vfs_resolver() {
    let temp_dir =
        std::env::temp_dir().join(format!("nanai_vfs_resolver_dir_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&temp_dir);
    let sub = temp_dir.join("Shell").join("Master");
    std::fs::create_dir_all(&sub).unwrap();

    let descript_path = sub.join("descript.txt");
    let (sjis_bytes, _, _) = SHIFT_JIS.encode("charset,Shift_JIS\r\nname,マスター");
    std::fs::write(&descript_path, &sjis_bytes).unwrap();

    let binary_path = sub.join("surface0000.png");
    std::fs::write(&binary_path, [0x89, 0x50, 0x4E, 0x47]).unwrap();

    let resolver = VfsResolver::new(&temp_dir);
    assert_eq!(resolver.root_dir(), temp_dir.as_path());

    // 大文字小文字混在の解決
    assert!(resolver.exists("shell/master/descript.txt"));
    assert!(resolver.exists("SHELL/MASTER/SURFACE0000.PNG"));
    assert!(!resolver.exists("shell/master/nonexistent.txt"));

    // read_text
    let text = resolver.read_text("shell/master/descript.txt").unwrap();
    assert!(text.contains("charset,Shift_JIS"));
    assert!(text.contains("name,マスター"));

    // read_binary
    let bin = resolver
        .read_binary("shell/master/surface0000.png")
        .unwrap();
    assert_eq!(bin, vec![0x89, 0x50, 0x4E, 0x47]);

    // list_dir
    let entries = resolver.list_dir("shell/master").unwrap();
    assert!(entries.contains(&"descript.txt".to_string()));
    assert!(entries.contains(&"surface0000.png".to_string()));

    // not found errors
    assert!(resolver.read_text("invalid/path.txt").is_err());
    assert!(resolver.read_binary("invalid/path.bin").is_err());
    assert!(resolver.list_dir("invalid/path").is_err());

    let _ = std::fs::remove_dir_all(&temp_dir);
}

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

    // read_text (Shift_JIS auto-decode)
    let desc = mock.read_text("ghost/master/descript.txt").unwrap();
    assert!(desc.contains("name,モック"));

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

    // remove_file
    assert!(mock.remove_file("GHOST/MASTER/AYA.DLL"));
    assert!(!mock.exists("ghost/master/aya.dll"));
    assert_eq!(mock.len(), 2);

    // clear
    mock.clear();
    assert!(mock.is_empty());
    assert_eq!(mock.len(), 0);
}

#[test]
fn test_vfs_resolver_cache_and_fast_path() {
    let temp_dir =
        std::env::temp_dir().join(format!("nanai_vfs_cache_test_dir_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&temp_dir);
    let sub = temp_dir.join("Shell").join("Master");
    std::fs::create_dir_all(&sub).unwrap();

    let descript_path = sub.join("descript.txt");
    std::fs::write(&descript_path, "charset,UTF-8\r\nname,FastPathTest").unwrap();

    let resolver = VfsResolver::new(&temp_dir);

    // 1回目の解決 (走査または高速パス)
    let resolved_1 = resolver.resolve("shell/master/descript.txt");
    assert!(resolved_1.is_some());

    // 2回目の解決 (キャッシュヒット)
    let resolved_2 = resolver.resolve("SHELL/MASTER/DESCRIPT.TXT");
    assert_eq!(resolved_1, resolved_2);

    // キャッシュクリア
    resolver.clear_cache();
    let resolved_3 = resolver.resolve_cached("shell/master/descript.txt");
    assert_eq!(resolved_1, resolved_3);

    let _ = std::fs::remove_dir_all(&temp_dir);
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
fn test_vfs_resolver_walk_files_and_cache_size() {
    let temp_dir =
        std::env::temp_dir().join(format!("nanai_vfs_walk_test_dir_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&temp_dir);
    let sub1 = temp_dir.join("ghost").join("master");
    let sub2 = temp_dir.join("shell").join("master");
    std::fs::create_dir_all(&sub1).unwrap();
    std::fs::create_dir_all(&sub2).unwrap();

    std::fs::write(sub1.join("descript.txt"), "ghost").unwrap();
    std::fs::write(sub2.join("descript.txt"), "shell").unwrap();
    std::fs::write(sub2.join("surface0000.png"), "png").unwrap();

    let resolver = VfsResolver::new(&temp_dir);
    assert_eq!(resolver.cache_size(), 0);

    // キャッシュ蓄積確認
    assert!(resolver.exists("ghost/master/descript.txt"));
    assert_eq!(resolver.cache_size(), 1);
    assert!(resolver.exists("shell/master/surface0000.png"));
    assert_eq!(resolver.cache_size(), 2);

    // walk_files (ルート起点)
    let walked_all = resolver.walk_files("").unwrap();
    assert_eq!(
        walked_all,
        vec![
            "ghost/master/descript.txt".to_string(),
            "shell/master/descript.txt".to_string(),
            "shell/master/surface0000.png".to_string(),
        ]
    );

    // walk_files (サブディレクトリ起点)
    let walked_shell = resolver.walk_files("shell/master").unwrap();
    assert_eq!(
        walked_shell,
        vec!["descript.txt".to_string(), "surface0000.png".to_string(),]
    );

    resolver.clear_cache();
    assert_eq!(resolver.cache_size(), 0);

    let _ = std::fs::remove_dir_all(&temp_dir);
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
fn test_vfs_resolver_cache_overflow_and_errors() {
    let temp = std::env::temp_dir().join(format!("vfs_test_{}", std::process::id()));
    std::fs::create_dir_all(&temp).unwrap();
    let file_path = temp.join("not_a_dir.txt");
    std::fs::write(&file_path, "content").unwrap();

    let resolver = VfsResolver::new(&temp);

    // Test cache overflow (>1000 items)
    for i in 0..1005 {
        let _ = resolver.resolve_cached(&format!("nonexistent_path_{}.txt", i));
    }
    assert!(resolver.cache_size() <= 1000);

    // walk_files on non-existent directory
    let walk_res = resolver.walk_files("does_not_exist_dir");
    assert!(walk_res.is_err());

    // walk_files on a file
    let walk_file_res = resolver.walk_files("not_a_dir.txt");
    assert!(walk_file_res.is_err());

    // list_dir on a file (triggers read_dir error)
    let list_file_res = resolver.list_dir("not_a_dir.txt");
    assert!(list_file_res.is_err());

    // list_dir with empty string / "."
    let list_root = resolver.list_dir(".");
    assert!(list_root.is_ok());

    let _ = std::fs::remove_dir_all(&temp);
}

#[test]
fn test_vfs_resolver_virtual_file_system_trait() {
    let temp = std::env::temp_dir().join(format!("vfs_trait_{}", std::process::id()));
    let sub = temp.join("sub");
    std::fs::create_dir_all(&sub).unwrap();
    std::fs::write(sub.join("test.txt"), "hello trait").unwrap();

    let resolver = VfsResolver::new(&temp);
    let vfs: &dyn VirtualFileSystem = &resolver;

    assert!(vfs.exists("sub/test.txt"));
    assert_eq!(vfs.read_text("sub/test.txt").unwrap(), "hello trait");
    assert_eq!(vfs.read_binary("sub/test.txt").unwrap(), b"hello trait".to_vec());
    assert_eq!(vfs.list_dir("sub").unwrap(), vec!["test.txt".to_string()]);
    assert_eq!(vfs.walk_files("").unwrap(), vec!["sub/test.txt".to_string()]);

    let _ = std::fs::remove_dir_all(&temp);
}

#[test]
fn test_vfs_resolver_dir_cache_overflow() {
    let temp = std::env::temp_dir().join(format!("vfs_dircache_overflow_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&temp);
    std::fs::create_dir_all(&temp).unwrap();

    for i in 0..505 {
        let sub = temp.join(format!("dir_{}", i));
        std::fs::create_dir_all(&sub).unwrap();
        std::fs::write(sub.join("file.txt"), "content").unwrap();
    }

    let resolver = VfsResolver::new(&temp);
    for i in 0..505 {
        let _ = resolver.resolve(&format!("dir_{}/file.txt", i));
    }
    assert!(resolver.dir_cache_size() <= 500);

    let _ = std::fs::remove_dir_all(&temp);
}

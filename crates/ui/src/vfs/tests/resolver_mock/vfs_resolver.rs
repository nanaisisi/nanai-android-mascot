/**
 * @file vfs_resolver.rs
 * @brief VfsResolver 実ファイルシステム解決・大文字小文字不問キャッシュ単体テスト
 */

use super::*;

#[test]
fn test_vfs_resolver() {
    let temp_dir = unique_temp_dir("nanai_vfs_resolver_dir");
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

    // resolve_with_extensions
    let ext_resolved =
        resolver.resolve_with_extensions("shell/master/surface0000", &[".png", ".bmp"]);
    assert!(ext_resolved.is_some());
    assert!(
        ext_resolved
            .unwrap()
            .to_string_lossy()
            .to_lowercase()
            .ends_with("surface0000.png")
    );

    let ext_resolved_dotless =
        resolver.resolve_with_extensions("shell/master/surface0000", &["png", "bmp"]);
    assert!(ext_resolved_dotless.is_some());

    let ext_none = resolver.resolve_with_extensions("shell/master/nonexistent", &[".png", ".bmp"]);
    assert!(ext_none.is_none());

    // is_file, is_dir, file_size
    assert!(resolver.is_file("shell/master/descript.txt"));
    assert!(!resolver.is_dir("shell/master/descript.txt"));
    assert!(resolver.is_dir("shell/master"));
    assert!(resolver.is_dir(""));
    assert!(!resolver.is_file("shell/master"));
    assert_eq!(
        resolver.file_size("shell/master/surface0000.png").unwrap(),
        4
    );
    assert!(resolver.file_size("shell/master").is_err());
    assert!(resolver.file_size("nonexistent.txt").is_err());

    // read_lines
    let lines = resolver.read_lines("shell/master/descript.txt").unwrap();
    assert_eq!(lines.len(), 2);
    assert_eq!(lines[0], "charset,Shift_JIS");
    assert_eq!(lines[1], "name,マスター");

    // find_files (VirtualFileSystem トレイト経由)
    let vfs_resolver: &dyn VirtualFileSystem = &resolver;
    let found_surf = vfs_resolver.find_files("surface").unwrap();
    assert_eq!(found_surf, vec!["Shell/Master/surface0000.png".to_string()]);
    let found_desc = vfs_resolver.find_files("descript").unwrap();
    assert_eq!(found_desc, vec!["Shell/Master/descript.txt".to_string()]);

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
}

#[test]
fn test_vfs_resolver_cache_and_fast_path() {
    let temp_dir = unique_temp_dir("nanai_vfs_cache_test_dir");
    let sub = temp_dir.join("Shell").join("Master");
    std::fs::create_dir_all(&sub).unwrap();

    let descript_path = sub.join("descript.txt");
    std::fs::write(&descript_path, "charset,UTF-8\r\nname,FastPathTest").unwrap();

    let resolver = VfsResolver::new(&temp_dir);

    // 1回目の解決
    let resolved_1 = resolver.resolve("shell/master/descript.txt");
    assert!(resolved_1.is_some());

    // 2回目の解決 (キャッシュヒット)
    let resolved_2 = resolver.resolve("SHELL/MASTER/DESCRIPT.TXT");
    assert_eq!(resolved_1, resolved_2);

    // キャッシュクリア
    resolver.clear_cache();
    let resolved_3 = resolver.resolve_cached("shell/master/descript.txt");
    assert_eq!(resolved_1, resolved_3);
}

#[test]
fn test_vfs_resolver_walk_files_and_cache_size() {
    let temp_dir = unique_temp_dir("nanai_vfs_walk_test_dir");
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
}

#[test]
fn test_vfs_resolver_cache_overflow_and_errors() {
    let temp = unique_temp_dir("vfs_test");
    std::fs::create_dir_all(&temp).unwrap();
    let file_path = temp.join("not_a_dir.txt");
    std::fs::write(&file_path, "content").unwrap();

    let resolver = VfsResolver::new(&temp);
    let _ = resolver.list_dir(".");

    // Test cache overflow (>1000 items)
    for i in 0..1001 {
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
}

#[test]
fn test_vfs_resolver_virtual_file_system_trait() {
    let temp = unique_temp_dir("vfs_trait");
    let sub = temp.join("sub");
    std::fs::create_dir_all(&sub).unwrap();
    std::fs::write(sub.join("test.txt"), "hello trait").unwrap();

    let resolver = VfsResolver::new(&temp);
    let vfs: &dyn VirtualFileSystem = &resolver;

    assert!(vfs.exists("sub/test.txt"));
    assert_eq!(vfs.read_text("sub/test.txt").unwrap(), "hello trait");
    assert_eq!(
        vfs.read_binary("sub/test.txt").unwrap(),
        b"hello trait".to_vec()
    );
    assert_eq!(vfs.list_dir("sub").unwrap(), vec!["test.txt".to_string()]);
    assert_eq!(
        vfs.walk_files("").unwrap(),
        vec!["sub/test.txt".to_string()]
    );
}

#[test]
fn test_vfs_resolver_dir_cache_overflow() {
    let temp = unique_temp_dir("vfs_dircache_overflow");
    let resolver = VfsResolver::new(&temp);

    for i in 0..501 {
        let _ = resolver.resolve(&format!("dir_{}/file.txt", i));
    }
    assert!(resolver.dir_cache_size() <= 500);
}

#[test]
fn test_vfs_resolver_edge_cases() {
    let temp = unique_temp_dir("vfs_resolver_edge");
    let file_path = temp.join("file.txt");
    std::fs::write(&file_path, "content").unwrap();

    let resolver = VfsResolver::new(&temp);
    let _ = resolver.list_dir(".");
    assert!(resolver.walk_files("file.txt").is_err());

    let sub = temp.join("SubDir");
    std::fs::create_dir_all(&sub).unwrap();
    std::fs::write(sub.join("a.txt"), "a").unwrap();
    std::fs::write(sub.join("b.txt"), "b").unwrap();
    assert!(resolver.resolve("subdir/A.TXT").is_some());
    assert!(resolver.resolve("subdir/B.TXT").is_some());

    for i in 0..1001 {
        let _ = resolver.resolve(&format!("file_{}.txt", i));
    }
    assert!(resolver.cache_size() <= 1000);
}

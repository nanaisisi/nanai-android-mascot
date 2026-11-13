/**
 * @file cache_overflow.rs
 * @brief VfsResolver キャッシュヒット、高速パス、キャッシュオーバーフロー制御、および異常系単体テスト
 */
use super::*;

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

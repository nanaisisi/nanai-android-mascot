/**
 * @file vfs_traits.rs
 * @brief VirtualFileSystem トレイトおよび MockVfs/VfsResolver の拡張操作単体テスト
 */
use super::*;

#[test]
fn test_mock_vfs_extended_operations() {
    let mut mock = MockVfs::new();
    mock.add_text_file("shell/master/surface0000.png", "img0");

    // has_dir
    assert!(mock.has_dir("shell"));
    assert!(mock.has_dir("shell/master"));
    assert!(!mock.has_dir("ghost"));
    assert!(!mock.has_dir("shell/variant"));

    // copy_file
    assert!(mock.copy_file(
        "shell/master/surface0000.png",
        "shell/master/surface0001.png"
    ));
    assert!(mock.exists("shell/master/surface0001.png"));
    assert_eq!(
        mock.read_text("shell/master/surface0001.png").unwrap(),
        "img0"
    );
    assert!(!mock.copy_file("nonexistent.png", "target.png"));

    // rename_file
    assert!(mock.rename_file(
        "shell/master/surface0001.png",
        "shell/master/surface0002.png"
    ));
    assert!(!mock.exists("shell/master/surface0001.png"));
    assert!(mock.exists("shell/master/surface0002.png"));
    assert!(!mock.rename_file("nonexistent.png", "target.png"));

    // write_file, write_text_file, append_file, create_dir
    mock.write_text_file("notes/todo.txt", "line1\n");
    mock.append_file("notes/todo.txt", b"line2\n");
    assert_eq!(mock.read_text("notes/todo.txt").unwrap(), "line1\nline2\n");
    assert_eq!(
        mock.file_size("notes/todo.txt").unwrap(),
        "line1\nline2\n".len() as u64
    );
    assert!(mock.is_file("notes/todo.txt"));
    assert!(!mock.is_dir("notes/todo.txt"));
    assert!(mock.is_dir("notes"));

    mock.create_dir("empty_folder");
    assert!(mock.has_dir("empty_folder"));
    assert!(mock.is_dir("empty_folder"));

    // VfsResolver dir_cache_size & directory caching
    let temp_dir =
        std::env::temp_dir().join(format!("nanai_dircache_traits_ext_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&temp_dir);
    let sub = temp_dir.join("Shell").join("Master");
    std::fs::create_dir_all(&sub).unwrap();
    std::fs::write(sub.join("Surface0000.png"), "png").unwrap();

    let resolver = VfsResolver::new(&temp_dir);
    assert_eq!(resolver.dir_cache_size(), 0);

    // 解決実行
    let resolved = resolver.resolve("shell/master/surface0000.png");
    assert!(resolved.is_some());
    let _ = resolver.dir_cache_size();

    // VfsResolver read_binary_range
    let range = resolver
        .read_binary_range("shell/master/surface0000.png", 0, 2)
        .unwrap();
    assert_eq!(range, b"pn");

    let _ = std::fs::remove_dir_all(&temp_dir);
}

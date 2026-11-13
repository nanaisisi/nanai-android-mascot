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

    // VfsResolver read_chunks
    let chunks = resolver
        .read_chunks("shell/master/surface0000.png", 2)
        .unwrap();
    assert_eq!(chunks.len(), 2);
    assert_eq!(chunks[0], b"pn");
    assert_eq!(chunks[1], b"g");

    // walk_files_with_max_depth
    let files_depth0 = resolver.walk_files_with_max_depth("", 0).unwrap();
    assert!(files_depth0.is_empty()); // root has only Shell/

    let files_depth2 = resolver.walk_files_with_max_depth("", 2).unwrap();
    assert_eq!(files_depth2.len(), 1);
    assert_eq!(files_depth2[0], "Shell/Master/Surface0000.png");

    let _ = std::fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_vfs_traits_cycle10_streaming_and_utf32() {
    let mut mock = MockVfs::new();
    mock.add_file("large.bin", vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // read_chunks
    let chunks = mock.read_chunks("large.bin", 4).unwrap();
    assert_eq!(chunks.len(), 3);
    assert_eq!(chunks[0], vec![1, 2, 3, 4]);
    assert_eq!(chunks[1], vec![5, 6, 7, 8]);
    assert_eq!(chunks[2], vec![9, 10]);

    assert!(mock.read_chunks("large.bin", 0).is_err());

    // UTF-32LE BOM detection & decode
    // "AB" in UTF-32LE: BOM(FF FE 00 00) + 'A'(41 00 00 00) + 'B'(42 00 00 00)
    let utf32le_bytes = vec![
        0xFF, 0xFE, 0x00, 0x00, 0x41, 0x00, 0x00, 0x00, 0x42, 0x00, 0x00, 0x00,
    ];
    let res_le = crate::encoding::detect_and_decode_ext(&utf32le_bytes);
    assert_eq!(res_le.encoding, "UTF-32LE");
    assert_eq!(res_le.text, "AB");
    assert!(!res_le.had_errors);

    // UTF-32BE BOM detection & decode
    // "AB" in UTF-32BE: BOM(00 00 FE FF) + 'A'(00 00 00 41) + 'B'(00 00 00 42)
    let utf32be_bytes = vec![
        0x00, 0x00, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x41, 0x00, 0x00, 0x00, 0x42,
    ];
    let res_be = crate::encoding::detect_and_decode_ext(&utf32be_bytes);
    assert_eq!(res_be.encoding, "UTF-32BE");
    assert_eq!(res_be.text, "AB");
    assert!(!res_be.had_errors);
}

/**
 * @file overlay_vfs.rs
 * @brief OverlayVfs 多層レイヤー重ね合わせ・優先度フォールバック単体テスト
 */
use super::*;

#[test]
fn test_virtual_file_system_trait_and_overlay() {
    let mut base_layer = MockVfs::new();
    base_layer.add_text_file("shell/master/descript.txt", "name,BaseShell\nversion,1.0");
    base_layer.add_text_file("shell/master/surface0000.png", "base-png-bytes");
    base_layer.add_text_file("ghost/master/shiori.dll", "mock-dll");

    let mut custom_layer = MockVfs::new();
    custom_layer.add_text_file("shell/master/surface0000.png", "custom-png-bytes");
    custom_layer.add_text_file("shell/master/extra.txt", "extra-data");

    let mut overlay = OverlayVfs::new();
    assert!(overlay.is_empty());
    assert_eq!(overlay.layer_count(), 0);

    // baseレイヤーとcustomレイヤー（最優先）の追加
    overlay.push_base(Arc::new(base_layer));
    overlay.push_top(Arc::new(custom_layer));

    assert_eq!(overlay.layer_count(), 2);
    assert_eq!(overlay.layers().len(), 2);
    assert!(!overlay.is_empty());

    // is_file, is_dir, file_size
    assert!(overlay.is_file("shell/master/descript.txt"));
    assert!(!overlay.is_dir("shell/master/descript.txt"));
    assert!(overlay.is_dir("shell/master"));
    assert_eq!(
        overlay.file_size("shell/master/extra.txt").unwrap(),
        "extra-data".len() as u64
    );

    // read_lines
    let lines = overlay.read_lines("shell/master/descript.txt").unwrap();
    assert_eq!(lines, vec!["name,BaseShell", "version,1.0"]);

    // exists
    assert!(overlay.exists("shell/master/descript.txt"));
    assert!(overlay.exists("SHELL/MASTER/SURFACE0000.PNG"));
    assert!(overlay.exists("shell/master/extra.txt"));
    assert!(overlay.exists("ghost/master/shiori.dll"));
    assert!(!overlay.exists("shell/master/nonexistent.txt"));

    // customレイヤーが優先されることの確認 (surface0000.png)
    let surf = overlay.read_text("shell/master/surface0000.png").unwrap();
    assert_eq!(surf, "custom-png-bytes");

    // baseレイヤーからフォールバック解決されることの確認
    let desc = overlay.read_text("shell/master/descript.txt").unwrap();
    assert_eq!(desc, "name,BaseShell\nversion,1.0");

    let extra = overlay.read_text("shell/master/extra.txt").unwrap();
    assert_eq!(extra, "extra-data");

    // list_dir（両レイヤーのマージ・重複排除）
    let entries = overlay.list_dir("shell/master").unwrap();
    assert_eq!(
        entries,
        vec![
            "descript.txt".to_string(),
            "extra.txt".to_string(),
            "surface0000.png".to_string(),
        ]
    );

    // walk_files（再帰的走査のマージ）
    let all_files = overlay.walk_files("").unwrap();
    assert_eq!(
        all_files,
        vec![
            "ghost/master/shiori.dll".to_string(),
            "shell/master/descript.txt".to_string(),
            "shell/master/extra.txt".to_string(),
            "shell/master/surface0000.png".to_string(),
        ]
    );

    // 未存在ファイルの読み込みエラー
    assert!(overlay.read_text("not_found.txt").is_err());
    assert!(overlay.read_binary("not_found.bin").is_err());
    assert!(overlay.list_dir("nonexistent_dir").is_err());
    assert!(overlay.walk_files("nonexistent_dir").is_err());

    let empty_overlay = OverlayVfs::new();
    assert!(empty_overlay.list_dir("any").unwrap().is_empty());
    assert!(empty_overlay.walk_files("any").unwrap().is_empty());

    // find_files (VirtualFileSystem トレイト経由での多層検索・重複排除テスト)
    let found_surfaces = overlay.find_files("surface").unwrap();
    assert_eq!(
        found_surfaces,
        vec!["shell/master/surface0000.png".to_string()]
    );
    let found_txt = overlay.find_files(".txt").unwrap();
    assert_eq!(
        found_txt,
        vec![
            "shell/master/descript.txt".to_string(),
            "shell/master/extra.txt".to_string(),
        ]
    );

    // クリア
    overlay.clear();
    assert!(overlay.is_empty());
    assert_eq!(overlay.layer_count(), 0);
    assert!(!overlay.exists("shell/master/descript.txt"));
    assert!(overlay.find_files("surface").unwrap().is_empty());
}

#[test]
fn test_overlay_vfs_with_layers_and_binary() {
    let mut base_layer = MockVfs::new();
    base_layer.add_file("bin.dat", vec![10, 20, 30]);

    let overlay = OverlayVfs::with_layers(vec![Arc::new(base_layer)]);
    assert_eq!(overlay.layer_count(), 1);
    let bin = overlay.read_binary("bin.dat").unwrap();
    assert_eq!(bin, vec![10, 20, 30]);
}

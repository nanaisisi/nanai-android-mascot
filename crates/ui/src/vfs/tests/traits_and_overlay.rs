use super::super::*;
use std::sync::Arc;

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
    assert!(!overlay.is_empty());

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

    // クリア
    overlay.clear();
    assert!(overlay.is_empty());
    assert_eq!(overlay.layer_count(), 0);
    assert!(!overlay.exists("shell/master/descript.txt"));
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

#[test]
fn test_path_safety_and_sanitization() {
    // 正常な相対パス
    assert!(is_safe_vfs_path("shell/master/surface0000.png"));
    assert!(is_safe_vfs_path("./shell/master/descript.txt"));
    assert!(is_safe_vfs_path("shell/../shell/master/surface0000.png"));
    assert_eq!(
        sanitize_vfs_path("shell/master/surface0000.png"),
        Some("shell/master/surface0000.png".to_string())
    );
    assert_eq!(
        sanitize_vfs_path("./shell/../shell/master"),
        Some("shell/master".to_string())
    );

    // 不正なパス: nullバイト
    assert!(!is_safe_vfs_path("shell/master\0/foo"));
    assert_eq!(sanitize_vfs_path("shell/master\0/foo"), None);

    // 不正なパス: ルート脱出 (`..` 濫用)
    assert!(!is_safe_vfs_path("../etc/passwd"));
    assert!(!is_safe_vfs_path("shell/../../outside"));
    assert_eq!(sanitize_vfs_path("../etc/passwd"), None);
    assert_eq!(sanitize_vfs_path("shell/../../secret.txt"), None);

    // 不正なパス: 絶対パス
    assert!(!is_safe_vfs_path("/etc/passwd"));
    assert!(!is_safe_vfs_path("\\Windows\\System32"));
    assert!(!is_safe_vfs_path("C:\\Windows\\System32"));
    assert!(!is_safe_vfs_path("D:/Data/file.txt"));
    assert_eq!(sanitize_vfs_path("/root/test"), None);

    // 空文字列
    assert_eq!(sanitize_vfs_path(""), None);
}

#[test]
fn test_encode_to_charset_and_normalize_newlines() {
    let test_str = "こんにちは\r\n世界\rテスト\n完了";

    // normalize_newlines
    let norm = normalize_newlines(test_str);
    assert_eq!(norm, "こんにちは\n世界\nテスト\n完了");

    // Shift_JIS エンコード
    let sjis_bytes = encode_to_charset("こんにちは", "Shift_JIS").unwrap();
    let (decoded_sjis, enc) = detect_and_decode(&sjis_bytes);
    assert_eq!(decoded_sjis, "こんにちは");
    assert_eq!(enc, "Shift_JIS");

    // CP932 エイリアス
    let cp932_bytes = encode_to_charset("テスト", "cp932").unwrap();
    assert_eq!(detect_and_decode(&cp932_bytes).0, "テスト");

    // EUC-JP エンコード（header charset declaration付きでのデコード確認）
    let euc_bytes = encode_to_charset("charset,EUC-JP\r\nname,EUCテキスト", "EUC-JP").unwrap();
    let (decoded_euc, enc_euc) = detect_and_decode(&euc_bytes);
    assert!(decoded_euc.contains("EUCテキスト"));
    assert_eq!(enc_euc, "EUC-JP");

    // ISO-2022-JP エンコード
    let jis_bytes = encode_to_charset("JISテキスト", "iso-2022-jp").unwrap();
    let (decoded_jis, _) = detect_and_decode(&jis_bytes);
    assert_eq!(decoded_jis, "JISテキスト");

    // UTF-8 エンコード
    let utf8_bytes = encode_to_charset("UTF-8テキスト", "UTF-8").unwrap();
    assert_eq!(utf8_bytes, "UTF-8テキスト".as_bytes());

    // UTF-16LE / BE エンコード
    let u16le_bytes = encode_to_charset("UTF16LE", "UTF-16LE").unwrap();
    let mut u16le_with_bom = vec![0xFF, 0xFE];
    u16le_with_bom.extend_from_slice(&u16le_bytes);
    let (decoded_u16le, _) = detect_and_decode(&u16le_with_bom);
    assert_eq!(decoded_u16le, "UTF16LE");

    let u16be_bytes = encode_to_charset("UTF16BE", "UTF-16BE").unwrap();
    let mut u16be_with_bom = vec![0xFE, 0xFF];
    u16be_with_bom.extend_from_slice(&u16be_bytes);
    let (decoded_u16be, _) = detect_and_decode(&u16be_with_bom);
    assert_eq!(decoded_u16be, "UTF16BE");

    // 未知文字コード
    assert!(encode_to_charset("test", "unknown-charset-123").is_none());
}

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

    // VfsResolver dir_cache_size & directory caching
    let temp_dir = std::env::temp_dir().join(format!("nanai_dircache_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&temp_dir);
    let sub = temp_dir.join("Shell").join("Master");
    std::fs::create_dir_all(&sub).unwrap();
    std::fs::write(sub.join("Surface0000.png"), "png").unwrap();

    let resolver = VfsResolver::new(&temp_dir);
    assert_eq!(resolver.dir_cache_size(), 0);

    // 解決実行により リゾルバーが正常動作することを確認
    let resolved = resolver.resolve("shell/master/surface0000.png");
    assert!(resolved.is_some());
    let _ = resolver.dir_cache_size();

    let _ = std::fs::remove_dir_all(&temp_dir);
}

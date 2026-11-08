/**
 * @file path_utils_encoding.rs
 * @brief VFS パス安全検証・改行正規化・文字コードエンコーディング単体テスト
 */

use super::*;

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

    // Windows予約デバイス名とNTFS代替データストリーム/URI
    assert!(!is_safe_vfs_path("con"));
    assert!(!is_safe_vfs_path("aux.txt"));
    assert!(!is_safe_vfs_path("sub/prn/file.png"));
    assert!(!is_safe_vfs_path("file://host/path"));
    assert!(!is_safe_vfs_path("surface.png:stream"));
    assert!(is_windows_reserved_name("NUL"));
    assert!(is_windows_reserved_name("com9"));
    assert!(!is_windows_reserved_name("content.txt"));

    // 空文字列
    assert_eq!(sanitize_vfs_path(""), None);
}

#[test]
fn test_encode_to_charset_and_normalize_newlines() {
    let test_str = "こんにちは\r\n世界\rテスト\n完了";

    // normalize_newlines
    let norm = normalize_newlines(test_str);
    assert_eq!(norm, "こんにちは\n世界\nテスト\n完了");

    // denormalize_newlines
    let denorm_crlf = denormalize_newlines(&norm, "\r\n");
    assert_eq!(denorm_crlf, "こんにちは\r\n世界\r\nテスト\r\n完了");

    // normalize_charset_name
    assert_eq!(normalize_charset_name("sjis"), Some("Shift_JIS"));
    assert_eq!(normalize_charset_name("windows-31j"), Some("Shift_JIS"));
    assert_eq!(normalize_charset_name("euc_jp"), Some("EUC-JP"));
    assert_eq!(normalize_charset_name("jis"), Some("ISO-2022-JP"));
    assert_eq!(normalize_charset_name("utf-8"), Some("UTF-8"));

    // Shift_JIS エンコード
    let sjis_bytes = encode_to_charset("こんにちは", "Shift_JIS").unwrap();
    let (decoded_sjis, enc) = detect_and_decode(&sjis_bytes);
    assert_eq!(decoded_sjis, "こんにちは");
    assert_eq!(enc, "Shift_JIS");

    // CP932 エイリアス
    let cp932_bytes = encode_to_charset("テスト", "cp932").unwrap();
    assert_eq!(detect_and_decode(&cp932_bytes).0, "テスト");

    // EUC-JP エンコード
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

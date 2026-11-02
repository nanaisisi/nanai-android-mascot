use super::super::*;
use encoding_rs::{EUC_JP, SHIFT_JIS};
use std::fs::File;
use std::io::Write;

#[test]
fn test_normalize_vfs_path() {
    assert_eq!(normalize_vfs_path("foo/bar/baz.txt"), "foo/bar/baz.txt");
    assert_eq!(normalize_vfs_path("foo\\bar\\baz.txt"), "foo/bar/baz.txt");
    assert_eq!(normalize_vfs_path("./foo/../bar/baz.txt"), "bar/baz.txt");
    assert_eq!(normalize_vfs_path("/foo//bar/"), "foo/bar");
    assert_eq!(normalize_vfs_path(""), "");
}

#[test]
fn test_open_text_file_utf8_and_sjis() {
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join(format!("nanai_test_vfs_{}.txt", std::process::id()));

    // Write UTF-8 with BOM
    {
        let mut f = File::create(&file_path).unwrap();
        f.write_all(&[0xEF, 0xBB, 0xBF]).unwrap();
        f.write_all("こんにちは".as_bytes()).unwrap();
    }
    let content = open_text_file(&file_path).unwrap();
    assert_eq!(content, "こんにちは");

    // Write Shift_JIS
    {
        let (sjis_bytes, _, _) = SHIFT_JIS.encode("テスト");
        let mut f = File::create(&file_path).unwrap();
        f.write_all(&sjis_bytes).unwrap();
    }
    let content2 = open_text_file(&file_path).unwrap();
    assert_eq!(content2, "テスト");

    // Write invalid Shift_JIS byte sequence (0x80 is invalid in CP932/Shift_JIS)
    {
        let mut f = File::create(&file_path).unwrap();
        f.write_all(&[0x80, 0xFD, 0xFE, 0xFF]).unwrap();
    }
    let _ = open_text_file(&file_path).unwrap();

    assert!(open_shift_jis_file(file_path.to_str().unwrap()).is_ok());
    let _ = std::fs::remove_file(&file_path);
}

#[test]
fn test_open_text_file_plain_utf8_and_error() {
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join(format!("nanai_plain_utf8_{}.txt", std::process::id()));

    std::fs::write(&file_path, "Hello UTF8").unwrap();
    assert_eq!(open_text_file(&file_path).unwrap(), "Hello UTF8");

    let bad_path = temp_dir.join("non_existent_file_12345.txt");
    assert!(open_text_file(&bad_path).is_err());

    let _ = std::fs::remove_file(&file_path);
}

#[test]
fn test_resolve_vfs_path() {
    let temp_dir = std::env::temp_dir().join(format!("nanai_vfs_test_dir_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&temp_dir);
    let sub_dir = temp_dir.join("SubFolder");
    std::fs::create_dir_all(&sub_dir).unwrap();
    let file_path = sub_dir.join("Target.txt");
    std::fs::write(&file_path, "hello").unwrap();

    let resolved = resolve_vfs_path(&temp_dir, "subfolder/target.txt");
    assert!(resolved.is_some());

    let _ = std::fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_resolve_vfs_path_edge_cases() {
    let temp_dir = std::env::temp_dir().join(format!("nanai_vfs_edge_dir_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&temp_dir);
    let sub = temp_dir.join("SubFolder");
    std::fs::create_dir_all(&sub).unwrap();

    let resolved = resolve_vfs_path(&temp_dir, "./SubFolder/../SubFolder");
    assert!(resolved.is_some());

    let file = sub.join("File.txt");
    let other = sub.join("AA_Other.txt");
    std::fs::write(&other, "other").unwrap();
    std::fs::write(&file, "data").unwrap();

    assert!(resolve_vfs_path(&temp_dir, "subfolder/file.txt").is_some());
    assert!(resolve_vfs_path(&temp_dir, "subfolder/nonexistent.txt").is_none());
    assert!(resolve_vfs_path(&temp_dir, "nonexistent/file.txt").is_none());
    assert!(resolve_vfs_path(&file, "sub/file.txt").is_none());

    let _ = std::fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_detect_and_decode() {
    // UTF-8 with BOM
    let mut bom_utf8 = vec![0xEF, 0xBB, 0xBF];
    bom_utf8.extend_from_slice("BOMテキスト".as_bytes());
    let (decoded, encoding) = detect_and_decode(&bom_utf8);
    assert_eq!(decoded, "BOMテキスト");
    assert_eq!(encoding, "UTF-8 (BOM)");

    // Plain UTF-8
    let plain_utf8 = "通常のUTF-8文字列".as_bytes();
    let (decoded, encoding) = detect_and_decode(plain_utf8);
    assert_eq!(decoded, "通常のUTF-8文字列");
    assert_eq!(encoding, "UTF-8");

    // Shift_JIS / CP932
    let (sjis_bytes, _, _) = SHIFT_JIS.encode("Shift_JIS文字列");
    let (decoded, encoding) = detect_and_decode(&sjis_bytes);
    assert_eq!(decoded, "Shift_JIS文字列");
    assert_eq!(encoding, "Shift_JIS");

    // Header charset declaration (Shift_JIS)
    let header_sjis_text = "charset,Shift_JIS\r\nname,テストゴースト";
    let (sjis_header_bytes, _, _) = SHIFT_JIS.encode(header_sjis_text);
    let (decoded_sjis, enc_sjis) = detect_and_decode(&sjis_header_bytes);
    assert_eq!(decoded_sjis, header_sjis_text);
    assert_eq!(enc_sjis, "Shift_JIS");

    // Header charset declaration (UTF-8)
    let header_utf8_text = "charset,UTF-8\r\nname,テストゴースト";
    let (decoded_utf8, enc_utf8) = detect_and_decode(header_utf8_text.as_bytes());
    assert_eq!(decoded_utf8, header_utf8_text);
    assert_eq!(enc_utf8, "UTF-8");
}

#[test]
fn test_detect_and_decode_utf16_and_eucjp() {
    // UTF-16LE BOM (u16コードユニットからLEバイト列を手動生成: WHATWG仕様によりUTF-16のエンコーダはUTF-8を出力するため)
    let sample_str = "UTF-16LE文字列";
    let mut bom_utf16le = vec![0xFF, 0xFE];
    for u in sample_str.encode_utf16() {
        bom_utf16le.extend_from_slice(&u.to_le_bytes());
    }
    let (decoded_le, enc_le) = detect_and_decode(&bom_utf16le);
    assert_eq!(decoded_le, sample_str);
    assert_eq!(enc_le, "UTF-16LE");

    // UTF-16BE BOM
    let sample_be_str = "UTF-16BE文字列";
    let mut bom_utf16be = vec![0xFE, 0xFF];
    for u in sample_be_str.encode_utf16() {
        bom_utf16be.extend_from_slice(&u.to_be_bytes());
    }
    let (decoded_be, enc_be) = detect_and_decode(&bom_utf16be);
    assert_eq!(decoded_be, sample_be_str);
    assert_eq!(enc_be, "UTF-16BE");

    // Header charset declaration (EUC-JP)
    let header_eucjp_text = "charset,EUC-JP\r\nname,EUCゴースト";
    let (eucjp_header_bytes, _, _) = EUC_JP.encode(header_eucjp_text);
    let (decoded_euc, enc_euc) = detect_and_decode(&eucjp_header_bytes);
    assert_eq!(decoded_euc, header_eucjp_text);
    assert_eq!(enc_euc, "EUC-JP");

    // Header charset declaration (ujis)
    let header_ujis_text = "charset,ujis\r\nname,UJISゴースト";
    let (ujis_header_bytes, _, _) = EUC_JP.encode(header_ujis_text);
    let (decoded_ujis, enc_ujis) = detect_and_decode(&ujis_header_bytes);
    assert_eq!(decoded_ujis, header_ujis_text);
    assert_eq!(enc_ujis, "EUC-JP");

    // Path resolution with . and .. (using case difference so direct_combined fails)
    let temp_dir = std::env::temp_dir().join(format!("vfs_dot_test_{}", std::process::id()));
    let sub = temp_dir.join("SubDir");
    std::fs::create_dir_all(&sub).unwrap();
    let target_file = temp_dir.join("RootFile.txt");
    std::fs::write(&target_file, "root content").unwrap();

    let resolved_dot = resolve_vfs_path(&temp_dir, "./subdir/../rootfile.txt");
    assert_eq!(resolved_dot, Some(target_file.clone()));

    let _ = std::fs::remove_dir_all(&temp_dir);
}

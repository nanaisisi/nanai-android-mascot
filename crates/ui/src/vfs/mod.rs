mod path;
mod encoding;
mod resolver;
mod mock;

pub use path::{normalize_vfs_path, resolve_vfs_path};
pub use encoding::{detect_and_decode, open_shift_jis_file, open_text_file};
pub use resolver::VfsResolver;
pub use mock::MockVfs;

#[cfg(test)]
mod tests {
    use super::*;
    use encoding_rs::{EUC_JP, ISO_2022_JP, SHIFT_JIS};
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
    }

    #[test]
    fn test_vfs_resolver() {
        let temp_dir = std::env::temp_dir().join(format!("nanai_vfs_resolver_dir_{}", std::process::id()));
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
        let temp_dir = std::env::temp_dir().join(format!("nanai_vfs_cache_test_dir_{}", std::process::id()));
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
    fn test_iso_2022_jp_and_quoted_charset_headers() {
        // Quoted charset in header
        let quoted_sjis = "charset,\"Shift_JIS\"\r\nname,クォートSJIS";
        let (sjis_bytes, _, _) = SHIFT_JIS.encode(quoted_sjis);
        let (decoded_q_sjis, enc_q_sjis) = detect_and_decode(&sjis_bytes);
        assert_eq!(decoded_q_sjis, quoted_sjis);
        assert_eq!(enc_q_sjis, "Shift_JIS");

        let single_quoted_utf8 = "charset, 'UTF-8' \r\nname,SingleQuoteUTF8";
        let (decoded_q_utf8, enc_q_utf8) = detect_and_decode(single_quoted_utf8.as_bytes());
        assert_eq!(decoded_q_utf8, single_quoted_utf8);
        assert_eq!(enc_q_utf8, "UTF-8");

        // Header declared ISO-2022-JP
        let header_jis = "charset,ISO-2022-JP\r\nname,JISゴースト";
        let (jis_bytes, _, _) = ISO_2022_JP.encode(header_jis);
        let (decoded_jis, enc_jis) = detect_and_decode(&jis_bytes);
        assert_eq!(decoded_jis, header_jis);
        assert_eq!(enc_jis, "ISO-2022-JP");

        // Raw ISO-2022-JP with escape sequence without charset declaration
        let raw_jis_text = "こんにちは世界 (JIS)";
        let (raw_jis_bytes, _, _) = ISO_2022_JP.encode(raw_jis_text);
        let (decoded_raw, enc_raw) = detect_and_decode(&raw_jis_bytes);
        assert_eq!(decoded_raw, raw_jis_text);
        assert_eq!(enc_raw, "ISO-2022-JP");
    }

    #[test]
    fn test_vfs_resolver_walk_files_and_cache_size() {
        let temp_dir = std::env::temp_dir().join(format!("nanai_vfs_walk_test_dir_{}", std::process::id()));
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
    }
}

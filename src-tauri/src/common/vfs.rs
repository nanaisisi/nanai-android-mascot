//! Slot-03: VFS & 文字コード正規化
//!
//! 大小文字不問パス解決 (Windows/Linux/Android差分吸収)、
//! Shift_JIS(CP932)/UTF-8自動判定、およびインメモリVFSスタブ (MockVfs) を提供します。

#[cfg(test)]
mod tests {

    use nanai_android_mascot_ui::{
        MockVfs, OverlayVfs, VirtualFileSystem, denormalize_newlines, detect_and_decode_ext,
        detect_mime_type, is_safe_vfs_path, is_windows_reserved_name, normalize_charset_name,
        normalize_vfs_path, sanitize_vfs_path, wildcard_match,
    };
    use std::sync::Arc;

    #[test]
    fn test_common_vfs_reexports() {
        let mut mock = MockVfs::new();
        mock.add_text_file("Shell/Master/descript.txt", "name,Master");
        mock.add_text_file("Shell/Master/surface0000.png", "img-bytes");
        assert!(mock.exists("shell/master/descript.txt"));

        let text = mock.read_text("SHELL/MASTER/DESCRIPT.TXT").unwrap();
        assert_eq!(text, "name,Master");

        let norm = normalize_vfs_path("foo\\bar//baz/../qux");
        assert_eq!(norm, "foo/bar/qux");

        // Cycle 4 functions
        let found = mock.find_files("surface");
        assert_eq!(found, vec!["Shell/Master/surface0000.png".to_string()]);

        // Cycle 6 functions
        mock.append_file("Shell/Master/descript.txt", b"\nversion,2.0");
        let vfs: &dyn VirtualFileSystem = &mock;
        assert_eq!(
            vfs.file_size("shell/master/descript.txt").unwrap(),
            ("name,Master\nversion,2.0".len() as u64)
        );
        assert!(vfs.is_file("shell/master/descript.txt"));
        assert!(vfs.is_dir("shell/master"));

        let lines = vfs.read_lines("shell/master/descript.txt").unwrap();
        assert_eq!(lines, vec!["name,Master", "version,2.0"]);

        // Cycle 8 functions: VirtualFileSystem::find_files
        let vfs_found = vfs.find_files("surface").unwrap();
        assert_eq!(vfs_found, vec!["Shell/Master/surface0000.png".to_string()]);

        assert_eq!(detect_mime_type("surface0000.png"), "image/png");

        let dec = detect_and_decode_ext(b"charset=Shift_JIS\r\ntext");
        assert_eq!(dec.encoding, "Shift_JIS");

        let mut overlay = OverlayVfs::new();
        overlay.push_base(Arc::new(mock.clone()));
        assert_eq!(overlay.layer_count(), 1);
        assert!(overlay.is_file("shell/master/surface0000.png"));

        // Cycle 9 functions: extended VirtualFileSystem & charset/MIME & path security
        assert!(is_windows_reserved_name("CON"));
        assert!(is_windows_reserved_name("nul.txt"));
        assert!(is_windows_reserved_name("com1"));
        assert!(!is_windows_reserved_name("normal_file.txt"));

        assert!(!is_safe_vfs_path("foo/con/bar.txt"));
        assert!(!is_safe_vfs_path("file://host/path"));
        assert!(!is_safe_vfs_path("foo:stream"));
        assert!(is_safe_vfs_path("shell/master/surface0000.png"));
        assert_eq!(
            sanitize_vfs_path("shell\\master/surface0000.png"),
            Some("shell/master/surface0000.png".to_string())
        );

        assert_eq!(normalize_charset_name("sjis"), Some("Shift_JIS"));
        assert_eq!(normalize_charset_name("ms932"), Some("Shift_JIS"));
        assert_eq!(normalize_charset_name("utf8"), Some("UTF-8"));

        assert_eq!(detect_mime_type("bg.svg"), "image/svg+xml");
        assert_eq!(detect_mime_type("sound.flac"), "audio/flac");
        assert_eq!(detect_mime_type("sound.opus"), "audio/opus");
        assert_eq!(detect_mime_type("config.plist"), "application/x-plist");

        let crlf_denorm = denormalize_newlines("line1\nline2\n", "\r\n");
        assert_eq!(crlf_denorm, "line1\r\nline2\r\n");

        assert!(wildcard_match("*.png", "surface0000.png"));
        assert!(wildcard_match("surface???.png", "surface001.png"));
        assert!(!wildcard_match("surface???.png", "surface0001.png"));

        let pngs = vfs.filter_by_extension(".png").unwrap();
        assert_eq!(pngs, vec!["Shell/Master/surface0000.png".to_string()]);

        let globbed = vfs.glob_files("*surface*.png").unwrap();
        assert_eq!(globbed, vec!["Shell/Master/surface0000.png".to_string()]);

        let resolved_cand =
            vfs.resolve_file_with_extensions("Shell/Master/surface0000", &[".bmp", ".png"]);
        assert_eq!(
            resolved_cand,
            Some("Shell/Master/surface0000.png".to_string())
        );

        let partial_bytes = vfs
            .read_binary_range("Shell/Master/surface0000.png", 0, 3)
            .unwrap();
        assert_eq!(partial_bytes, b"img");

        let overlay_vfs: &dyn VirtualFileSystem = &overlay;
        assert_eq!(
            overlay_vfs.filter_by_extension("png").unwrap(),
            vec!["Shell/Master/surface0000.png".to_string()]
        );
        assert_eq!(
            overlay_vfs.glob_files("*0000.png").unwrap(),
            vec!["Shell/Master/surface0000.png".to_string()]
        );
        assert_eq!(
            overlay_vfs
                .read_binary_range("Shell/Master/surface0000.png", 0, 3)
                .unwrap(),
            b"img"
        );

        let removed = mock.remove_dir("shell/master");
        assert_eq!(removed, 2);
        assert!(mock.is_empty());
    }
}

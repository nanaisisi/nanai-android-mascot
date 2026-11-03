//! Slot-03: VFS & 文字コード正規化
//!
//! 大小文字不問パス解決 (Windows/Linux/Android差分吸収)、
//! Shift_JIS(CP932)/UTF-8自動判定、およびインメモリVFSスタブ (MockVfs) を提供します。

#[cfg(test)]
mod tests {

    use nanai_android_mascot_ui::{
        MockVfs, OverlayVfs, VirtualFileSystem, detect_and_decode_ext, detect_mime_type,
        normalize_vfs_path,
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
        assert_eq!(vfs.file_size("shell/master/descript.txt").unwrap(), ("name,Master\nversion,2.0".len() as u64));
        assert!(vfs.is_file("shell/master/descript.txt"));
        assert!(vfs.is_dir("shell/master"));

        let lines = vfs.read_lines("shell/master/descript.txt").unwrap();
        assert_eq!(lines, vec!["name,Master", "version,2.0"]);

        assert_eq!(detect_mime_type("surface0000.png"), "image/png");

        let dec = detect_and_decode_ext(b"charset=Shift_JIS\r\ntext");
        assert_eq!(dec.encoding, "Shift_JIS");

        let mut overlay = OverlayVfs::new();
        overlay.push_base(Arc::new(mock.clone()));
        assert_eq!(overlay.layer_count(), 1);
        assert!(overlay.is_file("shell/master/surface0000.png"));

        let removed = mock.remove_dir("shell/master");
        assert_eq!(removed, 2);
        assert!(mock.is_empty());
    }
}

//! Slot-03: VFS & 文字コード正規化
//!
//! 大小文字不問パス解決 (Windows/Linux/Android差分吸収)、
//! Shift_JIS(CP932)/UTF-8自動判定、およびインメモリVFSスタブ (MockVfs) を提供します。

#[cfg(test)]
mod tests {
    use super::*;

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

        let removed = mock.remove_dir("shell/master");
        assert_eq!(removed, 2);
        assert!(mock.is_empty());
    }
}

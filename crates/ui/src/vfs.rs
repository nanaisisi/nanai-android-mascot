use encoding_rs::SHIFT_JIS;
use std::io;
use std::path::{Path, PathBuf};

/// バイト列から文字コードを自動判定（UTF-8 BOM / UTF-8 / Shift_JIS・CP932）してデコードし、
/// デコード後の文字列と判定された文字コード名を返す。
pub fn detect_and_decode(buffer: &[u8]) -> (String, &'static str) {
    // 1. UTF-8 BOM チェック (0xEF, 0xBB, 0xBF)
    if buffer.starts_with(&[0xEF, 0xBB, 0xBF])
        && let Ok(utf8_str) = std::str::from_utf8(&buffer[3..])
    {
        return (utf8_str.to_string(), "UTF-8 (BOM)");
    }

    // 2. 標準 UTF-8 としてのパース試行
    if let Ok(utf8_str) = std::str::from_utf8(buffer) {
        return (utf8_str.to_string(), "UTF-8");
    }

    // 3. Shift_JIS / CP932 フォールバックデコード
    let (cow, _encoding_used, had_errors) = SHIFT_JIS.decode(buffer);
    if had_errors {
        eprintln!("Warning: Some Shift_JIS characters couldn't be decoded properly");
    }

    (cow.into_owned(), "Shift_JIS")
}

/// テキストファイルを自動判定（UTF-8 / BOM / Shift_JIS）で開き、UTF-8文字列として返す
pub fn open_text_file(path: &Path) -> Result<String, io::Error> {
    let buffer = std::fs::read(path)?;
    let (decoded, _) = detect_and_decode(&buffer);
    Ok(decoded)
}

/// 後方互換用エイリアス
pub fn open_shift_jis_file(path: &str) -> Result<String, io::Error> {
    open_text_file(Path::new(path))
}

/// 大文字・小文字の差異を吸収してファイルパスを解決する VFS リゾルバー（Linux/Android対応）
pub fn resolve_vfs_path(base_dir: &Path, relative_path: &str) -> Option<PathBuf> {
    let mut current = base_dir.to_path_buf();
    for part in relative_path.split(['/', '\\']) {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            current.pop();
            continue;
        }

        // 大文字小文字を無視して一致するエントリを探索
        let target_lower = part.to_lowercase();
        let mut matched = None;
        if let Ok(entries) = std::fs::read_dir(&current) {
            for entry in entries.flatten() {
                if entry.file_name().to_string_lossy().to_lowercase() == target_lower {
                    matched = Some(entry.path());
                    break;
                }
            }
        }
        current = matched?;
    }
    Some(current)
}

/// 大小文字不問の仮想パス解決・ファイル読み込みを提供するリゾルバー構造体
#[derive(Debug, Clone)]
pub struct VfsResolver {
    root_dir: PathBuf,
}

impl VfsResolver {
    /// ルートディレクトリを指定して `VfsResolver` を生成
    pub fn new<P: Into<PathBuf>>(root_dir: P) -> Self {
        Self {
            root_dir: root_dir.into(),
        }
    }

    /// ルートディレクトリを取得
    pub fn root_dir(&self) -> &Path {
        &self.root_dir
    }

    /// 大文字・小文字の差異を吸収して相対パスを絶対パスへ解決
    pub fn resolve(&self, relative_path: &str) -> Option<PathBuf> {
        resolve_vfs_path(&self.root_dir, relative_path)
    }

    /// 大文字・小文字の差異を吸収して対象ファイルが存在するか判定
    pub fn exists(&self, relative_path: &str) -> bool {
        self.resolve(relative_path).is_some()
    }

    /// 大小文字を吸収してテキストファイルを文字コード自動判別で読み込む
    pub fn read_text(&self, relative_path: &str) -> Result<String, io::Error> {
        match self.resolve(relative_path) {
            Some(resolved_path) => open_text_file(&resolved_path),
            None => Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in VFS: {}", relative_path),
            )),
        }
    }

    /// 大小文字を吸収してバイナリファイルを読み込む
    pub fn read_binary(&self, relative_path: &str) -> Result<Vec<u8>, io::Error> {
        match self.resolve(relative_path) {
            Some(resolved_path) => std::fs::read(resolved_path),
            None => Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in VFS: {}", relative_path),
            )),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::Write;

    #[test]
    fn test_open_text_file_utf8_and_sjis() {
        let temp_dir = std::env::temp_dir();
        let file_path = temp_dir.join("nanai_test_vfs.txt");

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
        let file_path = temp_dir.join("nanai_plain_utf8.txt");

        std::fs::write(&file_path, "Hello UTF8").unwrap();
        assert_eq!(open_text_file(&file_path).unwrap(), "Hello UTF8");

        let bad_path = temp_dir.join("non_existent_file_12345.txt");
        assert!(open_text_file(&bad_path).is_err());

        let _ = std::fs::remove_file(&file_path);
    }

    #[test]
    fn test_resolve_vfs_path() {
        let temp_dir = std::env::temp_dir().join("nanai_vfs_test_dir");
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
        let temp_dir = std::env::temp_dir().join("nanai_vfs_edge_dir");
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
    }

    #[test]
    fn test_vfs_resolver() {
        let temp_dir = std::env::temp_dir().join("nanai_vfs_resolver_dir");
        let _ = std::fs::remove_dir_all(&temp_dir);
        let sub = temp_dir.join("Shell").join("Master");
        std::fs::create_dir_all(&sub).unwrap();

        let descript_path = sub.join("descript.txt");
        let (sjis_bytes, _, _) = SHIFT_JIS.encode("charset,Shift_JIS\r\nname,マスター");
        std::fs::write(&descript_path, &sjis_bytes).unwrap();

        let binary_path = sub.join("surface0000.png");
        std::fs::write(&binary_path, &[0x89, 0x50, 0x4E, 0x47]).unwrap();

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
        let bin = resolver.read_binary("shell/master/surface0000.png").unwrap();
        assert_eq!(bin, vec![0x89, 0x50, 0x4E, 0x47]);

        // not found errors
        assert!(resolver.read_text("invalid/path.txt").is_err());
        assert!(resolver.read_binary("invalid/path.bin").is_err());

        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}

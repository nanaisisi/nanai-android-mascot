use encoding_rs::{EUC_JP, SHIFT_JIS, UTF_16BE, UTF_16LE};
use std::collections::HashMap;
use std::io;
use std::path::{Path, PathBuf};

/// パス文字列をスラッシュ区切りかつ冗長な `./` や `../` を整理した正規化形式へ変換
pub fn normalize_vfs_path(path: &str) -> String {
    let mut parts = Vec::new();
    for part in path.split(['/', '\\']) {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            parts.pop();
        } else {
            parts.push(part);
        }
    }
    parts.join("/")
}

/// バイト列から文字コードを自動判定（UTF-8 BOM / UTF-16 BOM / ヘッダー宣言 / UTF-8 / EUC-JP / Shift_JIS・CP932）してデコードし、
/// デコード後の文字列と判定された文字コード名を返す。
pub fn detect_and_decode(buffer: &[u8]) -> (String, &'static str) {
    // 1. BOM チェック
    // 1-1. UTF-8 BOM チェック (0xEF, 0xBB, 0xBF)
    if buffer.starts_with(&[0xEF, 0xBB, 0xBF])
        && let Ok(utf8_str) = std::str::from_utf8(&buffer[3..])
    {
        return (utf8_str.to_string(), "UTF-8 (BOM)");
    }

    // 1-2. UTF-16LE BOM チェック (0xFF, 0xFE)
    if buffer.starts_with(&[0xFF, 0xFE]) {
        let (cow, _, had_errors) = UTF_16LE.decode(&buffer[2..]);
        if !had_errors {
            return (cow.into_owned(), "UTF-16LE");
        }
    }

    // 1-3. UTF-16BE BOM チェック (0xFE, 0xFF)
    if buffer.starts_with(&[0xFE, 0xFF]) {
        let (cow, _, had_errors) = UTF_16BE.decode(&buffer[2..]);
        if !had_errors {
            return (cow.into_owned(), "UTF-16BE");
        }
    }

    // 2. ヘッダー宣言チェック (charset,Shift_JIS / charset,CP932 / charset,UTF-8 / charset,EUC-JP 等)
    // 最初の1024バイト程度をチェック
    let check_len = buffer.len().min(1024);
    let slice = &buffer[..check_len];
    let lower_ascii: Vec<u8> = slice.iter().map(|b| b.to_ascii_lowercase()).collect();

    if let Some(pos) = lower_ascii.windows(8).position(|w| w == b"charset,") {
        let remainder = &lower_ascii[pos + 8..];
        let end = remainder
            .iter()
            .position(|&b| b == b'\r' || b == b'\n' || b == b',' || b == b';')
            .unwrap_or(remainder.len());
        let charset_decl = String::from_utf8_lossy(&remainder[..end])
            .trim()
            .to_string();

        if charset_decl == "shift_jis"
            || charset_decl == "shift-jis"
            || charset_decl == "sjis"
            || charset_decl == "cp932"
            || charset_decl == "windows-31j"
        {
            let (cow, _, had_errors) = SHIFT_JIS.decode(buffer);
            if had_errors {
                eprintln!("Warning: Some Shift_JIS characters couldn't be decoded properly");
            }
            return (cow.into_owned(), "Shift_JIS");
        } else if charset_decl == "euc-jp"
            || charset_decl == "euc_jp"
            || charset_decl == "ujis"
            || charset_decl == "x-euc-jp"
        {
            let (cow, _, had_errors) = EUC_JP.decode(buffer);
            if had_errors {
                eprintln!("Warning: Some EUC-JP characters couldn't be decoded properly");
            }
            return (cow.into_owned(), "EUC-JP");
        } else if (charset_decl == "utf-8" || charset_decl == "utf8")
            && let Ok(utf8_str) = std::str::from_utf8(buffer)
        {
            return (utf8_str.to_string(), "UTF-8");
        }
    }

    // 3. 標準 UTF-8 としてのパース試行
    if let Ok(utf8_str) = std::str::from_utf8(buffer) {
        return (utf8_str.to_string(), "UTF-8");
    }

    // 4. EUC-JP パース試行（有効なEUC-JPでエラーなしの場合）
    let (euc_cow, _, euc_errors) = EUC_JP.decode(buffer);
    if !euc_errors && buffer.iter().any(|&b| b >= 0x80) {
        // Shift_JIS と重複する範囲もあるため、Shift_JISデコード時のエラー判定と突き合わせる
        let (sjis_cow, _, sjis_errors) = SHIFT_JIS.decode(buffer);
        if sjis_errors && !euc_errors {
            return (euc_cow.into_owned(), "EUC-JP");
        }
        if !sjis_errors {
            return (sjis_cow.into_owned(), "Shift_JIS");
        }
    }

    // 5. Shift_JIS / CP932 フォールバックデコード
    let (cow, _encoding_used, had_errors) = SHIFT_JIS.decode(buffer);
    if had_errors {
        eprintln!("Warning: Some Shift_JIS characters couldn't be decoded properly");
    }

    (cow.into_owned(), "Shift_JIS")
}

/// テキストファイルを自動判定（UTF-8 / BOM / Shift_JIS / EUC-JP / UTF-16）で開き、UTF-8文字列として返す
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

    // 高速パス: base_dir + relative_path で直接ファイルまたはディレクトリが存在する場合
    let direct_combined = base_dir.join(relative_path);
    if direct_combined.exists() {
        return Some(direct_combined);
    }

    for part in relative_path.split(['/', '\\']) {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            current.pop();
            continue;
        }

        // 高速パス: その階層で直接一致するエントリが存在する場合
        let direct_step = current.join(part);
        if direct_step.exists() {
            current = direct_step;
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

use std::sync::{Arc, Mutex};

/// 大小文字不問の仮想パス解決・ファイル読み込みを提供するリゾルバー構造体
#[derive(Debug, Clone)]
pub struct VfsResolver {
    root_dir: PathBuf,
    /// パス解決結果の内部キャッシュ (キー: 正規化・小文字化相対パス, 値: 解決結果)
    resolve_cache: Arc<Mutex<HashMap<String, Option<PathBuf>>>>,
}

impl VfsResolver {
    /// ルートディレクトリを指定して `VfsResolver` を生成
    pub fn new<P: Into<PathBuf>>(root_dir: P) -> Self {
        Self {
            root_dir: root_dir.into(),
            resolve_cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// ルートディレクトリを取得
    pub fn root_dir(&self) -> &Path {
        &self.root_dir
    }

    /// 大文字・小文字の差異を吸収して相対パスを絶対パスへ解決（キャッシュ利用）
    pub fn resolve(&self, relative_path: &str) -> Option<PathBuf> {
        self.resolve_cached(relative_path)
    }

    /// キャッシュ付きのパス解決メソッド
    pub fn resolve_cached(&self, relative_path: &str) -> Option<PathBuf> {
        let norm_key = normalize_vfs_path(relative_path).to_lowercase();
        if let Ok(guard) = self.resolve_cache.lock()
            && let Some(cached) = guard.get(&norm_key)
        {
            return cached.clone();
        }

        let resolved = resolve_vfs_path(&self.root_dir, relative_path);
        if let Ok(mut guard) = self.resolve_cache.lock() {
            // キャッシュ上限 (1000件) を超えた場合はクリアして再利用
            if guard.len() >= 1000 {
                guard.clear();
            }
            guard.insert(norm_key, resolved.clone());
        }
        resolved
    }

    /// キャッシュを明示的にクリア
    pub fn clear_cache(&self) {
        if let Ok(mut guard) = self.resolve_cache.lock() {
            guard.clear();
        }
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

    /// 指定ディレクトリ直下のエントリ一覧（小文字統一なしのファイル名一覧）を取得
    pub fn list_dir(&self, relative_path: &str) -> Result<Vec<String>, io::Error> {
        let dir_path = match relative_path.trim() {
            "" | "." => self.root_dir.clone(),
            _ => self.resolve(relative_path).ok_or_else(|| {
                io::Error::new(
                    io::ErrorKind::NotFound,
                    format!("Directory not found in VFS: {}", relative_path),
                )
            })?,
        };

        let mut results = Vec::new();
        for entry in std::fs::read_dir(dir_path)?.flatten() {
            results.push(entry.file_name().to_string_lossy().to_string());
        }
        results.sort();
        Ok(results)
    }
}

/// メモリベースのインメモリ仮想ファイルシステム（スタブ・テスト・WASM用）
///
/// 大文字・小文字の表記揺れおよび `/` と `\` のパスセパレータを吸収し、
/// ファイルの追加・参照・デコード・一覧取得を提供します。
#[derive(Debug, Clone, Default)]
pub struct MockVfs {
    /// 正規化・小文字化した相対パス -> (オリジナルの相対パス, バイト列)
    files: HashMap<String, (String, Vec<u8>)>,
}

impl MockVfs {
    /// 新規 `MockVfs` インスタンスを生成
    pub fn new() -> Self {
        Self {
            files: HashMap::new(),
        }
    }

    /// ファイルをインメモリVFSに追加
    pub fn add_file<P: AsRef<str>>(&mut self, path: P, data: Vec<u8>) {
        let norm_orig = normalize_vfs_path(path.as_ref());
        let key = norm_orig.to_lowercase();
        self.files.insert(key, (norm_orig, data));
    }

    /// 文字列データをUTF-8バイト列としてインメモリVFSに追加
    pub fn add_text_file<P: AsRef<str>>(&mut self, path: P, content: &str) {
        self.add_file(path, content.as_bytes().to_vec());
    }

    /// 大小文字を区別せず、ファイルが存在するか判定
    pub fn exists(&self, path: &str) -> bool {
        let key = normalize_vfs_path(path).to_lowercase();
        self.files.contains_key(&key)
    }

    /// 大小文字を区別せずバイナリデータを取得
    pub fn read_binary(&self, path: &str) -> Result<Vec<u8>, io::Error> {
        let key = normalize_vfs_path(path).to_lowercase();
        match self.files.get(&key) {
            Some((_, data)) => Ok(data.clone()),
            None => Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in MockVfs: {}", path),
            )),
        }
    }

    /// 大小文字を区別せず、自動文字コード判定（Shift_JIS / UTF-8）を行いテキストを取得
    pub fn read_text(&self, path: &str) -> Result<String, io::Error> {
        let bytes = self.read_binary(path)?;
        let (decoded, _) = detect_and_decode(&bytes);
        Ok(decoded)
    }

    /// 指定ディレクトリ配下の直下ファイル／サブディレクトリ名一覧を取得
    pub fn list_dir(&self, dir_path: &str) -> Vec<String> {
        let norm_dir = normalize_vfs_path(dir_path);
        let prefix = if norm_dir.is_empty() {
            String::new()
        } else {
            format!("{}/", norm_dir.to_lowercase())
        };

        let mut entries = Vec::new();
        for key in self.files.keys() {
            if !prefix.is_empty() && !key.starts_with(&prefix) {
                continue;
            }
            let sub = if prefix.is_empty() {
                key.as_str()
            } else {
                &key[prefix.len()..]
            };
            if let Some(first_segment) = sub.split('/').next()
                && !first_segment.is_empty()
                && !entries.contains(&first_segment.to_string())
            {
                entries.push(first_segment.to_string());
            }
        }
        entries.sort();
        entries
    }

    /// ファイルを削除
    pub fn remove_file(&mut self, path: &str) -> bool {
        let key = normalize_vfs_path(path).to_lowercase();
        self.files.remove(&key).is_some()
    }

    /// 全ファイルをクリア
    pub fn clear(&mut self) {
        self.files.clear();
    }

    /// 保持しているファイル数を取得
    pub fn len(&self) -> usize {
        self.files.len()
    }

    /// ファイルが空かどうか判定
    pub fn is_empty(&self) -> bool {
        self.files.is_empty()
    }

    /// 指定接頭辞配下の全ファイルパス（相対パス）を再帰的に取得
    pub fn walk_dir(&self, prefix: &str) -> Vec<String> {
        let norm_prefix = normalize_vfs_path(prefix);
        let prefix_lower = if norm_prefix.is_empty() {
            String::new()
        } else {
            format!("{}/", norm_prefix.to_lowercase())
        };

        let mut matched = Vec::new();
        for (key, (orig, _)) in &self.files {
            if prefix_lower.is_empty() || key.starts_with(&prefix_lower) {
                matched.push(orig.clone());
            }
        }
        matched.sort();
        matched
    }

    /// 指定した拡張子（大小文字不問、ドット有無どちらでも可）を持つファイル一覧を取得
    pub fn filter_by_extension(&self, ext: &str) -> Vec<String> {
        let clean_ext = ext.trim_start_matches('.').to_lowercase();
        let target_suffix = format!(".{}", clean_ext);

        let mut matched = Vec::new();
        for (key, (orig, _)) in &self.files {
            if key.ends_with(&target_suffix) {
                matched.push(orig.clone());
            }
        }
        matched.sort();
        matched
    }

    /// インメモリVFSが保持している全ファイルの合計バイト数を取得
    pub fn total_bytes(&self) -> usize {
        self.files.values().map(|(_, data)| data.len()).sum()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
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
        let temp_dir = std::env::temp_dir().join("nanai_vfs_cache_test_dir");
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
        let resolved_3 = resolver.resolve_cached("Shell/Master/descript.txt");
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
}

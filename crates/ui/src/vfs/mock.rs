use super::encoding::detect_and_decode;
use super::path::normalize_vfs_path;
use std::collections::HashMap;
use std::io;

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

    /// 指定ディレクトリ配下の全ファイルを再帰的に削除し、削除されたファイル数を返す
    pub fn remove_dir(&mut self, dir_path: &str) -> usize {
        let norm_dir = normalize_vfs_path(dir_path);
        if norm_dir.is_empty() {
            let count = self.files.len();
            self.files.clear();
            return count;
        }

        let prefix_lower = format!("{}/", norm_dir.to_lowercase());
        let before_count = self.files.len();
        self.files
            .retain(|k, _| !k.starts_with(&prefix_lower) && k != &norm_dir.to_lowercase());
        before_count - self.files.len()
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

    /// 部分一致パターン（ファイル名またはパス内のキーワード、大小文字不問）でファイルを検索
    pub fn find_files(&self, pattern: &str) -> Vec<String> {
        let pat_lower = pattern.to_lowercase();
        let mut matched = Vec::new();
        for (key, (orig, _)) in &self.files {
            if key.contains(&pat_lower) {
                matched.push(orig.clone());
            }
        }
        matched.sort();
        matched
    }
}

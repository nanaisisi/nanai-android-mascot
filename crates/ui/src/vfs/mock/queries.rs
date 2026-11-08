//! MockVfs のファイル存在確認・読み込み・検索・一覧取得モジュール

use super::MockVfs;
use crate::vfs::encoding::detect_and_decode;
use crate::vfs::path::normalize_vfs_path;
use std::io;

impl MockVfs {
    /// 大小文字を区別せず、ファイルが存在するか判定
    pub fn exists(&self, path: &str) -> bool {
        let key = normalize_vfs_path(path).to_lowercase();
        self.files.contains_key(&key)
    }

    /// 指定ディレクトリが存在するか（そのディレクトリ配下にファイルが存在するか）判定
    pub fn has_dir(&self, dir_path: &str) -> bool {
        let norm_dir = normalize_vfs_path(dir_path);
        if norm_dir.is_empty() {
            return !self.files.is_empty();
        }
        let prefix = format!("{}/", norm_dir.to_lowercase());
        self.files.keys().any(|k| k.starts_with(&prefix))
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

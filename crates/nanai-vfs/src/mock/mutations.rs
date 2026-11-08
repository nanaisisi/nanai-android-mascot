//! MockVfs のファイル追加・変更・削除・コピー・移動操作モジュール

use super::MockVfs;
use crate::path::normalize_vfs_path;

impl MockVfs {
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

    /// ファイルにバイトデータを上書きまたは新規作成
    pub fn write_file<P: AsRef<str>>(&mut self, path: P, data: Vec<u8>) {
        self.add_file(path, data);
    }

    /// ファイルにテキストデータを上書きまたは新規作成
    pub fn write_text_file<P: AsRef<str>>(&mut self, path: P, content: &str) {
        self.add_text_file(path, content);
    }

    /// 既存ファイルにバイト列を追記（存在しない場合は新規作成）
    pub fn append_file<P: AsRef<str>>(&mut self, path: P, data: &[u8]) {
        let norm_orig = normalize_vfs_path(path.as_ref());
        let key = norm_orig.to_lowercase();
        if let Some((_, existing)) = self.files.get_mut(&key) {
            existing.extend_from_slice(data);
        } else {
            self.files.insert(key, (norm_orig, data.to_vec()));
        }
    }

    /// 空のディレクトリマーカーを作成
    pub fn create_dir<P: AsRef<str>>(&mut self, dir_path: P) {
        let norm = normalize_vfs_path(dir_path.as_ref());
        if !norm.is_empty() {
            let marker = format!("{}/.keep", norm);
            if !self.exists(&marker) {
                self.add_file(marker, Vec::new());
            }
        }
    }

    /// ファイルをコピー（複製）する
    pub fn copy_file(&mut self, src: &str, dst: &str) -> bool {
        let src_key = normalize_vfs_path(src).to_lowercase();
        let data = match self.files.get(&src_key) {
            Some((_, data)) => data.clone(),
            None => return false,
        };
        self.add_file(dst, data);
        true
    }

    /// ファイル名を変更（移動）する
    pub fn rename_file(&mut self, src: &str, dst: &str) -> bool {
        let src_key = normalize_vfs_path(src).to_lowercase();
        let data = match self.files.remove(&src_key) {
            Some((_, data)) => data,
            None => return false,
        };
        self.add_file(dst, data);
        true
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
}

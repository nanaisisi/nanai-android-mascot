use super::encoding::open_text_file;
use super::path::{normalize_vfs_path, resolve_vfs_path};
use std::collections::HashMap;
use std::io;
use std::path::{Path, PathBuf};
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

    /// 現在キャッシュされているエントリ数を取得
    pub fn cache_size(&self) -> usize {
        self.resolve_cache.lock().map(|g| g.len()).unwrap_or(0)
    }

    /// 指定ディレクトリ配下の全ファイルを再帰的に走査（相対パスのリストを返す）
    pub fn walk_files(&self, relative_dir: &str) -> Result<Vec<String>, io::Error> {
        let base = match relative_dir.trim() {
            "" | "." => self.root_dir.clone(),
            _ => self.resolve(relative_dir).ok_or_else(|| {
                io::Error::new(
                    io::ErrorKind::NotFound,
                    format!("Directory not found in VFS: {}", relative_dir),
                )
            })?,
        };

        let mut collected = Vec::new();
        fn recurse(
            dir: &Path,
            _base: &Path,
            rel_prefix: &str,
            out: &mut Vec<String>,
        ) -> io::Result<()> {
            if !dir.is_dir() {
                return Ok(());
            }
            for entry in std::fs::read_dir(dir)? {
                let entry = entry?;
                let file_type = entry.file_type()?;
                let name = entry.file_name().to_string_lossy().to_string();
                let sub_rel = if rel_prefix.is_empty() {
                    name.clone()
                } else {
                    format!("{}/{}", rel_prefix, name)
                };

                if file_type.is_dir() {
                    recurse(&entry.path(), _base, &sub_rel, out)?;
                } else if file_type.is_file() {
                    out.push(sub_rel);
                }
            }
            Ok(())
        }

        recurse(&base, &base, "", &mut collected)?;
        collected.sort();
        Ok(collected)
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

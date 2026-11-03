use super::encoding::open_text_file;
use super::path::normalize_vfs_path;
use super::traits::VirtualFileSystem;
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
    /// ディレクトリ配下エントリの内部キャッシュ (キー: ディレクトリ絶対パス, 値: (小文字名 -> 実際のファイル名))
    dir_entries_cache: Arc<Mutex<HashMap<PathBuf, HashMap<String, String>>>>,
}

impl VfsResolver {
    /// ルートディレクトリを指定して `VfsResolver` を生成
    pub fn new<P: Into<PathBuf>>(root_dir: P) -> Self {
        Self {
            root_dir: root_dir.into(),
            resolve_cache: Arc::new(Mutex::new(HashMap::new())),
            dir_entries_cache: Arc::new(Mutex::new(HashMap::new())),
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
        if let Some(cached) = self
            .resolve_cache
            .lock()
            .ok()
            .and_then(|guard| guard.get(&norm_key).cloned())
        {
            return cached;
        }

        // 高速パス: `..` を含まずルート直下にそのまま存在するか確認
        if !relative_path.contains("..") {
            let direct_combined = self.root_dir.join(relative_path);
            if direct_combined.exists() {
                if let Ok(mut guard) = self.resolve_cache.lock() {
                    if guard.len() >= 1000 {
                        guard.clear();
                    }
                    guard.insert(norm_key, Some(direct_combined.clone()));
                }
                return Some(direct_combined);
            }
        }

        // ディレクトリエントリキャッシュを活用したステップ解決
        let mut current = self.root_dir.clone();
        let mut failed = false;

        for part in relative_path.split(['/', '\\']) {
            if part.is_empty() || part == "." {
                continue;
            }
            if part == ".." {
                current.pop();
                continue;
            }

            // 直接ステップが存在するか
            let direct_step = current.join(part);
            if direct_step.exists() {
                current = direct_step;
                continue;
            }

            // ディレクトリエントリのキャッシュを取得または生成
            let target_lower = part.to_lowercase();
            let mut matched_name = self.dir_entries_cache.lock().ok().and_then(|guard| {
                guard
                    .get(&current)
                    .and_then(|m| m.get(&target_lower).cloned())
            });

            if matched_name.is_none() {
                // キャッシュミス: ディレクトリをスキャンしてキャッシュ
                if let Ok(read_entries) = std::fs::read_dir(&current) {
                    let mut map = HashMap::new();
                    for entry in read_entries.flatten() {
                        let original_name = entry.file_name().to_string_lossy().to_string();
                        let lower = original_name.to_lowercase();
                        if lower == target_lower && matched_name.is_none() {
                            matched_name = Some(original_name.clone());
                        }
                        map.insert(lower, original_name);
                    }
                    if let Ok(mut guard) = self.dir_entries_cache.lock() {
                        if guard.len() >= 500 {
                            guard.clear();
                        }
                        guard.insert(current.clone(), map);
                    }
                }
            }

            match matched_name {
                Some(real_name) => {
                    current.push(real_name);
                }
                None => {
                    failed = true;
                    break;
                }
            }
        }

        let resolved = if failed { None } else { Some(current) };

        if let Ok(mut guard) = self.resolve_cache.lock() {
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
        if let Ok(mut guard) = self.dir_entries_cache.lock() {
            guard.clear();
        }
    }

    /// 現在キャッシュされているエントリ数を取得（パス解決キャッシュ数）
    pub fn cache_size(&self) -> usize {
        self.resolve_cache.lock().map(|g| g.len()).unwrap_or(0)
    }

    /// 現在キャッシュされているディレクトリ数
    pub fn dir_cache_size(&self) -> usize {
        self.dir_entries_cache.lock().map(|g| g.len()).unwrap_or(0)
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

impl VirtualFileSystem for VfsResolver {
    fn exists(&self, path: &str) -> bool {
        self.exists(path)
    }

    fn read_binary(&self, path: &str) -> io::Result<Vec<u8>> {
        self.read_binary(path)
    }

    fn read_text(&self, path: &str) -> io::Result<String> {
        self.read_text(path)
    }

    fn list_dir(&self, dir_path: &str) -> io::Result<Vec<String>> {
        self.list_dir(dir_path)
    }

    fn walk_files(&self, dir_path: &str) -> io::Result<Vec<String>> {
        self.walk_files(dir_path)
    }
}

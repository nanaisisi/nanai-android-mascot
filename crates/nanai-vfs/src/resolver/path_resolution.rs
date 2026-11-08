//! VfsResolver の大文字小文字不問パス解決・拡張子補完・キャッシュ管理モジュール

use super::VfsResolver;
use crate::path::normalize_vfs_path;
use std::collections::HashMap;
use std::path::PathBuf;

impl VfsResolver {
    /// 大文字・小文字の差異を吸収して相対パスを絶対パスへ解決（キャッシュ利用）
    pub fn resolve(&self, relative_path: &str) -> Option<PathBuf> {
        self.resolve_cached(relative_path)
    }

    /// 拡張子候補群を順次試行してファイルパスを解決
    ///
    /// 例: `surface0` に対して `[".png", ".pna", ".bmp"]` を指定すると、
    /// `surface0.png`、`surface0.pna`、`surface0.bmp` を大文字小文字不問で順に探索します。
    pub fn resolve_with_extensions(
        &self,
        relative_path: &str,
        extensions: &[&str],
    ) -> Option<PathBuf> {
        if let Some(direct) = self.resolve(relative_path)
            && direct.is_file()
        {
            return Some(direct);
        }

        for ext in extensions {
            let candidate = if ext.starts_with('.') {
                format!("{}{}", relative_path, ext)
            } else {
                format!("{}.{}", relative_path, ext)
            };
            if let Some(found) = self.resolve(&candidate)
                && found.is_file()
            {
                return Some(found);
            }
        }

        None
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
}

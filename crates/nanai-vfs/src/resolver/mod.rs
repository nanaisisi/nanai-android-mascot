//! 大小文字不問の仮想パス解決・ファイル読み込みリゾルバー (VfsResolver) モジュール

pub mod io_operations;
pub mod path_resolution;
pub mod vfs_trait;

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

/// 大小文字不問の仮想パス解決・ファイル読み込みを提供するリゾルバー構造体
#[derive(Debug, Clone)]
pub struct VfsResolver {
    pub(crate) root_dir: PathBuf,
    /// パス解決結果の内部キャッシュ (キー: 正規化・小文字化相対パス, 値: 解決結果)
    pub(crate) resolve_cache: Arc<Mutex<HashMap<String, Option<PathBuf>>>>,
    /// ディレクトリ配下エントリの内部キャッシュ (キー: ディレクトリ絶対パス, 値: (小文字名 -> 実際のファイル名))
    pub(crate) dir_entries_cache: Arc<Mutex<HashMap<PathBuf, HashMap<String, String>>>>,
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
}

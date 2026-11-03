use super::traits::VirtualFileSystem;
use std::io;
use std::sync::Arc;

/// 複数レイヤーの仮想ファイルシステムを重ね合わせて透過的に探索・読み込みを行う VFS
///
/// レイヤーはインデックス 0 番（最優先・上位レイヤー）から順に探索され、
/// 最初にファイルが見つかったレイヤーからデータが読み込まれます。
/// これにより、ユーザーカスタマイズスキンや拡張パッチを基本ゴーストアセットの上に
/// 非破壊で重ね合わせる（オーバーレイ）ことが可能になります。
#[derive(Clone, Default)]
pub struct OverlayVfs {
    layers: Vec<Arc<dyn VirtualFileSystem>>,
}

impl OverlayVfs {
    /// 空の `OverlayVfs` を生成
    pub fn new() -> Self {
        Self { layers: Vec::new() }
    }

    /// レイヤー一覧を指定して `OverlayVfs` を生成
    pub fn with_layers(layers: Vec<Arc<dyn VirtualFileSystem>>) -> Self {
        Self { layers }
    }

    /// 最上位（最優先）レイヤーを前置追加
    pub fn push_top(&mut self, layer: Arc<dyn VirtualFileSystem>) {
        self.layers.insert(0, layer);
    }

    /// 最下位（基本/フォールバック）レイヤーを末尾追加
    pub fn push_base(&mut self, layer: Arc<dyn VirtualFileSystem>) {
        self.layers.push(layer);
    }

    /// 登録されているレイヤー数を取得
    pub fn layer_count(&self) -> usize {
        self.layers.len()
    }

    /// レイヤーが空かどうか判定
    pub fn is_empty(&self) -> bool {
        self.layers.is_empty()
    }

    /// 全レイヤーをクリア
    pub fn clear(&mut self) {
        self.layers.clear();
    }

    /// 保持しているレイヤーの参照一覧を取得
    pub fn layers(&self) -> &[Arc<dyn VirtualFileSystem>] {
        &self.layers
    }

    /// 指定インデックスのレイヤーを削除
    pub fn remove_layer(&mut self, index: usize) -> Option<Arc<dyn VirtualFileSystem>> {
        if index < self.layers.len() {
            Some(self.layers.remove(index))
        } else {
            None
        }
    }
}

impl VirtualFileSystem for OverlayVfs {
    fn exists(&self, path: &str) -> bool {
        self.layers.iter().any(|layer| layer.exists(path))
    }

    fn read_binary(&self, path: &str) -> io::Result<Vec<u8>> {
        for layer in &self.layers {
            if layer.exists(path) {
                return layer.read_binary(path);
            }
        }
        Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("File not found in any OverlayVfs layers: {}", path),
        ))
    }

    fn read_text(&self, path: &str) -> io::Result<String> {
        for layer in &self.layers {
            if layer.exists(path) {
                return layer.read_text(path);
            }
        }
        Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("File not found in any OverlayVfs layers: {}", path),
        ))
    }

    fn list_dir(&self, dir_path: &str) -> io::Result<Vec<String>> {
        let mut merged = Vec::new();
        let mut any_found = false;

        for layer in &self.layers {
            if let Ok(entries) = layer.list_dir(dir_path) {
                if !entries.is_empty() {
                    any_found = true;
                    for entry in entries {
                        if !merged.contains(&entry) {
                            merged.push(entry);
                        }
                    }
                }
            }
        }

        if !any_found && !self.layers.is_empty() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("Directory not found in any OverlayVfs layers: {}", dir_path),
            ));
        }

        merged.sort();
        Ok(merged)
    }

    fn walk_files(&self, dir_path: &str) -> io::Result<Vec<String>> {
        let mut merged = Vec::new();
        let mut any_found = false;

        for layer in &self.layers {
            if let Ok(files) = layer.walk_files(dir_path) {
                if !files.is_empty() {
                    any_found = true;
                    for file in files {
                        if !merged.contains(&file) {
                            merged.push(file);
                        }
                    }
                }
            }
        }

        if !any_found && !self.layers.is_empty() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("Directory not found in any OverlayVfs layers: {}", dir_path),
            ));
        }

        merged.sort();
        Ok(merged)
    }

    fn file_size(&self, path: &str) -> io::Result<u64> {
        for layer in &self.layers {
            if layer.exists(path) {
                return layer.file_size(path);
            }
        }
        Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("File not found in any OverlayVfs layers: {}", path),
        ))
    }

    fn is_file(&self, path: &str) -> bool {
        for layer in &self.layers {
            if layer.exists(path) {
                return layer.is_file(path);
            }
        }
        false
    }

    fn is_dir(&self, path: &str) -> bool {
        for layer in &self.layers {
            if layer.is_dir(path) {
                return true;
            }
        }
        false
    }
}

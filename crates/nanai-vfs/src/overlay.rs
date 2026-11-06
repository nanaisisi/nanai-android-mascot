use super::traits::VirtualFileSystem;
use std::io;
use std::sync::Arc;

#[derive(Clone, Default)]
pub struct OverlayVfs {
    layers: Vec<Arc<dyn VirtualFileSystem>>,
}

impl OverlayVfs {
    pub fn new() -> Self {
        Self { layers: Vec::new() }
    }

    pub fn with_layers(layers: Vec<Arc<dyn VirtualFileSystem>>) -> Self {
        Self { layers }
    }

    pub fn push_top(&mut self, layer: Arc<dyn VirtualFileSystem>) {
        self.layers.insert(0, layer);
    }

    pub fn push_base(&mut self, layer: Arc<dyn VirtualFileSystem>) {
        self.layers.push(layer);
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
        for layer in &self.layers {
            if let Ok(entries) = layer.list_dir(dir_path) {
                for entry in entries {
                    if !merged.contains(&entry) {
                        merged.push(entry);
                    }
                }
            }
        }
        merged.sort();
        Ok(merged)
    }

    fn walk_files(&self, dir_path: &str) -> io::Result<Vec<String>> {
        let mut merged = Vec::new();
        for layer in &self.layers {
            if let Ok(files) = layer.walk_files(dir_path) {
                for file in files {
                    if !merged.contains(&file) {
                        merged.push(file);
                    }
                }
            }
        }
        merged.sort();
        Ok(merged)
    }
}

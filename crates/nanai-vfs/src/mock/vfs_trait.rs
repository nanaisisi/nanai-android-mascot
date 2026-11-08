//! MockVfs の VirtualFileSystem トレイト実装モジュール

use super::MockVfs;
use crate::path::normalize_vfs_path;
use crate::traits::VirtualFileSystem;
use std::io;

impl VirtualFileSystem for MockVfs {
    fn exists(&self, path: &str) -> bool {
        self.exists(path) || self.has_dir(path)
    }

    fn read_binary(&self, path: &str) -> io::Result<Vec<u8>> {
        self.read_binary(path)
    }

    fn read_text(&self, path: &str) -> io::Result<String> {
        self.read_text(path)
    }

    fn list_dir(&self, dir_path: &str) -> io::Result<Vec<String>> {
        Ok(self.list_dir(dir_path))
    }

    fn walk_files(&self, dir_path: &str) -> io::Result<Vec<String>> {
        Ok(self.walk_dir(dir_path))
    }

    fn file_size(&self, path: &str) -> io::Result<u64> {
        let key = normalize_vfs_path(path).to_lowercase();
        match self.files.get(&key) {
            Some((_, data)) => Ok(data.len() as u64),
            None => Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in MockVfs: {}", path),
            )),
        }
    }

    fn is_file(&self, path: &str) -> bool {
        let key = normalize_vfs_path(path).to_lowercase();
        self.files.contains_key(&key)
    }

    fn is_dir(&self, path: &str) -> bool {
        self.has_dir(path)
    }

    fn find_files(&self, pattern: &str) -> io::Result<Vec<String>> {
        Ok(self.find_files(pattern))
    }

    fn filter_by_extension(&self, ext: &str) -> io::Result<Vec<String>> {
        Ok(self.filter_by_extension(ext))
    }
}

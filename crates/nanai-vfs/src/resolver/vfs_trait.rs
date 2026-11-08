//! VfsResolver の VirtualFileSystem トレイト実装モジュール

use super::VfsResolver;
use crate::traits::VirtualFileSystem;
use std::io;

impl VirtualFileSystem for VfsResolver {
    fn exists(&self, path: &str) -> bool {
        VfsResolver::exists(self, path)
    }

    fn read_binary(&self, path: &str) -> io::Result<Vec<u8>> {
        VfsResolver::read_binary(self, path)
    }

    fn read_text(&self, path: &str) -> io::Result<String> {
        VfsResolver::read_text(self, path)
    }

    fn list_dir(&self, dir_path: &str) -> io::Result<Vec<String>> {
        VfsResolver::list_dir(self, dir_path)
    }

    fn walk_files(&self, dir_path: &str) -> io::Result<Vec<String>> {
        VfsResolver::walk_files(self, dir_path)
    }

    fn file_size(&self, path: &str) -> io::Result<u64> {
        match self.resolve(path) {
            Some(resolved) => {
                let metadata = std::fs::metadata(&resolved)?;
                if metadata.is_dir() {
                    Err(io::Error::other(format!(
                        "Path is a directory, not a file: {}",
                        path
                    )))
                } else {
                    Ok(metadata.len())
                }
            }
            None => Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in VFS: {}", path),
            )),
        }
    }

    fn is_file(&self, path: &str) -> bool {
        self.resolve(path).map(|p| p.is_file()).unwrap_or(false)
    }

    fn is_dir(&self, path: &str) -> bool {
        match path.trim() {
            "" | "." => self.root_dir.is_dir(),
            _ => self.resolve(path).map(|p| p.is_dir()).unwrap_or(false),
        }
    }

    fn find_files(&self, pattern: &str) -> io::Result<Vec<String>> {
        let pat_lower = pattern.to_lowercase();
        let all_files = self.walk_files("")?;
        let mut matched: Vec<String> = all_files
            .into_iter()
            .filter(|f| f.to_lowercase().contains(&pat_lower))
            .collect();
        matched.sort();
        Ok(matched)
    }

    fn resolve_file_with_extensions(&self, path: &str, extensions: &[&str]) -> Option<String> {
        self.resolve_with_extensions(path, extensions)
            .and_then(|p| {
                p.strip_prefix(&self.root_dir)
                    .ok()
                    .map(|rel| rel.to_string_lossy().to_string())
            })
    }

    fn read_binary_range(&self, path: &str, offset: u64, length: usize) -> io::Result<Vec<u8>> {
        let resolved = self.resolve(path).ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in VFS: {}", path),
            )
        })?;

        use std::fs::File;
        use std::io::{Read, Seek, SeekFrom};
        let mut file = File::open(resolved)?;
        file.seek(SeekFrom::Start(offset))?;
        let mut buffer = vec![0u8; length];
        let bytes_read = file.read(&mut buffer)?;
        buffer.truncate(bytes_read);
        Ok(buffer)
    }
}

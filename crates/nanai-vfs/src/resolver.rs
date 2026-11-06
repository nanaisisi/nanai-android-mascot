use super::encoding::open_text_file;
use super::path::normalize_vfs_path;
use super::traits::VirtualFileSystem;
use std::collections::HashMap;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone)]
pub struct VfsResolver {
    root_dir: PathBuf,
    resolve_cache: Arc<Mutex<HashMap<String, Option<PathBuf>>>>,
    dir_entries_cache: Arc<Mutex<HashMap<PathBuf, HashMap<String, String>>>>,
}

impl VfsResolver {
    pub fn new<P: Into<PathBuf>>(root_dir: P) -> Self {
        Self {
            root_dir: root_dir.into(),
            resolve_cache: Arc::new(Mutex::new(HashMap::new())),
            dir_entries_cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn resolve(&self, relative_path: &str) -> Option<PathBuf> {
        let norm = normalize_vfs_path(relative_path);
        let path_str = if norm.is_empty() { relative_path } else { &norm };
        let direct = self.root_dir.join(path_str);
        if direct.exists() {
            return Some(direct);
        }
        None
    }

    pub fn exists(&self, relative_path: &str) -> bool {
        self.resolve(relative_path).is_some()
    }

    pub fn read_text(&self, relative_path: &str) -> Result<String, io::Error> {
        match self.resolve(relative_path) {
            Some(resolved_path) => open_text_file(&resolved_path),
            None => Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in VFS: {}", relative_path),
            )),
        }
    }

    pub fn read_binary(&self, relative_path: &str) -> Result<Vec<u8>, io::Error> {
        match self.resolve(relative_path) {
            Some(resolved_path) => std::fs::read(resolved_path),
            None => Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in VFS: {}", relative_path),
            )),
        }
    }

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
        fn recurse(dir: &Path, rel_prefix: &str, out: &mut Vec<String>) -> io::Result<()> {
            for entry in std::fs::read_dir(dir)? {
                let entry = entry?;
                let file_type = entry.file_type()?;
                let name = entry.file_name().to_string_lossy().to_string();
                let sub_rel = if rel_prefix.is_empty() {
                    name
                } else {
                    format!("{}/{}", rel_prefix, name)
                };
                if file_type.is_dir() {
                    recurse(&entry.path(), &sub_rel, out)?;
                } else if file_type.is_file() {
                    out.push(sub_rel);
                }
            }
            Ok(())
        }
        recurse(&base, "", &mut collected)?;
        collected.sort();
        Ok(collected)
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

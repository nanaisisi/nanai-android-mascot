use super::encoding::detect_and_decode;
use super::path::normalize_vfs_path;
use super::traits::VirtualFileSystem;
use std::collections::HashMap;
use std::io;

#[derive(Debug, Clone, Default)]
pub struct MockVfs {
    files: HashMap<String, (String, Vec<u8>)>,
}

impl MockVfs {
    pub fn new() -> Self {
        Self {
            files: HashMap::new(),
        }
    }

    pub fn add_file<P: AsRef<str>>(&mut self, path: P, data: Vec<u8>) {
        let norm_orig = normalize_vfs_path(path.as_ref());
        let key = norm_orig.to_lowercase();
        self.files.insert(key, (norm_orig, data));
    }

    pub fn add_text_file<P: AsRef<str>>(&mut self, path: P, content: &str) {
        self.add_file(path, content.as_bytes().to_vec());
    }

    pub fn exists(&self, path: &str) -> bool {
        let key = normalize_vfs_path(path).to_lowercase();
        self.files.contains_key(&key)
    }

    pub fn read_binary(&self, path: &str) -> Result<Vec<u8>, io::Error> {
        let key = normalize_vfs_path(path).to_lowercase();
        match self.files.get(&key) {
            Some((_, data)) => Ok(data.clone()),
            None => Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found in MockVfs: {}", path),
            )),
        }
    }

    pub fn read_text(&self, path: &str) -> Result<String, io::Error> {
        let bytes = self.read_binary(path)?;
        let (decoded, _) = detect_and_decode(&bytes);
        Ok(decoded)
    }

    pub fn list_dir(&self, dir_path: &str) -> Vec<String> {
        let norm_dir = normalize_vfs_path(dir_path);
        let prefix = if norm_dir.is_empty() {
            String::new()
        } else {
            format!("{}/", norm_dir.to_lowercase())
        };

        let mut entries = Vec::new();
        for key in self.files.keys() {
            if !prefix.is_empty() && !key.starts_with(&prefix) {
                continue;
            }
            let sub = if prefix.is_empty() {
                key.as_str()
            } else {
                &key[prefix.len()..]
            };
            if let Some(first_segment) = sub.split('/').next()
                && !first_segment.is_empty()
                && !entries.contains(&first_segment.to_string())
            {
                entries.push(first_segment.to_string());
            }
        }
        entries.sort();
        entries
    }
}

impl VirtualFileSystem for MockVfs {
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
        Ok(self.list_dir(dir_path))
    }

    fn walk_files(&self, dir_path: &str) -> io::Result<Vec<String>> {
        let norm = normalize_vfs_path(dir_path);
        let prefix = if norm.is_empty() {
            String::new()
        } else {
            format!("{}/", norm.to_lowercase())
        };
        let mut out = Vec::new();
        for (key, (orig, _)) in &self.files {
            if prefix.is_empty() || key.starts_with(&prefix) {
                out.push(orig.clone());
            }
        }
        out.sort();
        Ok(out)
    }
}

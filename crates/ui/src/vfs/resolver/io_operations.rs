//! VfsResolver のファイル存在確認・テキスト/バイナリ読み込み・再帰走査 I/O モジュール

use super::VfsResolver;
use crate::vfs::encoding::open_text_file;
use std::io;
use std::path::Path;

impl VfsResolver {
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

        if !base.is_dir() {
            return Err(io::Error::new(
                io::ErrorKind::NotADirectory,
                format!("Not a directory: {}", relative_dir),
            ));
        }

        let mut collected = Vec::new();
        fn recurse(
            dir: &Path,
            _base: &Path,
            rel_prefix: &str,
            depth: usize,
            out: &mut Vec<String>,
        ) -> io::Result<()> {
            if depth > 32 || !dir.is_dir() {
                return Ok(());
            }
            for entry in std::fs::read_dir(dir)? {
                let entry = entry?;
                let file_type = entry.file_type()?;
                if file_type.is_symlink() {
                    continue;
                }
                let name = entry.file_name().to_string_lossy().to_string();
                let sub_rel = if rel_prefix.is_empty() {
                    name.clone()
                } else {
                    format!("{}/{}", rel_prefix, name)
                };

                if file_type.is_dir() {
                    recurse(&entry.path(), _base, &sub_rel, depth + 1, out)?;
                } else if file_type.is_file() {
                    out.push(sub_rel);
                }
            }
            Ok(())
        }

        recurse(&base, &base, "", 0, &mut collected)?;
        collected.sort();
        Ok(collected)
    }
}

use std::io;

/// 仮想ファイルシステム (VFS) の統一インターフェース
///
/// 物理ファイルシステム（`VfsResolver`）、インメモリストレージ（`MockVfs`）、
/// および多層重ね合わせ（`OverlayVfs`）を抽象化し、統一的にアクセスできるようにします。
pub trait VirtualFileSystem: Send + Sync {
    /// ファイルまたはディレクトリが存在するか判定
    fn exists(&self, path: &str) -> bool;

    /// バイナリデータを読み込み
    fn read_binary(&self, path: &str) -> io::Result<Vec<u8>>;

    /// テキストデータを文字コード自動判定でデコードして読み込み
    fn read_text(&self, path: &str) -> io::Result<String>;

    /// 指定ディレクトリ直下のエントリ一覧を取得
    fn list_dir(&self, dir_path: &str) -> io::Result<Vec<String>>;

    /// 指定ディレクトリ配下の全ファイルを再帰的に走査（相対パスのリストを返す）
    fn walk_files(&self, dir_path: &str) -> io::Result<Vec<String>>;

    /// ファイルのバイトサイズを取得
    fn file_size(&self, path: &str) -> io::Result<u64> {
        self.read_binary(path).map(|data| data.len() as u64)
    }

    /// 通常ファイルとして存在するか判定
    fn is_file(&self, path: &str) -> bool {
        self.exists(path) && !self.is_dir(path)
    }

    /// ディレクトリとして存在するか判定
    fn is_dir(&self, path: &str) -> bool {
        self.list_dir(path).is_ok()
    }

    /// テキストファイルを読み込み、改行コードを正規化して行ごとの文字列リストとして返す
    fn read_lines(&self, path: &str) -> io::Result<Vec<String>> {
        let text = self.read_text(path)?;
        let normalized = super::encoding::normalize_newlines(&text);
        let trimmed_content = normalized.strip_suffix('\n').unwrap_or(&normalized);
        if trimmed_content.is_empty() {
            return Ok(Vec::new());
        }
        Ok(trimmed_content.split('\n').map(|s| s.to_string()).collect())
    }

    /// 部分一致パターン（ファイル名またはパス内のキーワード、大小文字不問）でファイルを検索
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

    /// 指定した拡張子（ドット有無不問、大小文字不問）を持つファイル一覧を取得
    fn filter_by_extension(&self, ext: &str) -> io::Result<Vec<String>> {
        let clean = ext.trim_start_matches('.').to_lowercase();
        let target_suffix = format!(".{}", clean);
        let all_files = self.walk_files("")?;
        let mut matched: Vec<String> = all_files
            .into_iter()
            .filter(|f| f.to_lowercase().ends_with(&target_suffix))
            .collect();
        matched.sort();
        Ok(matched)
    }

    /// ワイルドカード（`*` は任意文字列、`?` は任意1文字、大小文字不問）でファイルを検索
    fn glob_files(&self, pattern: &str) -> io::Result<Vec<String>> {
        let pat_lower = pattern.to_lowercase();
        let all_files = self.walk_files("")?;
        let mut matched: Vec<String> = all_files
            .into_iter()
            .filter(|f| wildcard_match(&pat_lower, &f.to_lowercase()))
            .collect();
        matched.sort();
        Ok(matched)
    }

    /// 拡張子候補群を順次試行して、最初に見つかったファイル相対パスを解決
    fn resolve_file_with_extensions(&self, path: &str, extensions: &[&str]) -> Option<String> {
        if self.is_file(path) {
            return Some(path.to_string());
        }
        for ext in extensions {
            let candidate = if ext.starts_with('.') {
                format!("{}{}", path, ext)
            } else {
                format!("{}.{}", path, ext)
            };
            if self.is_file(&candidate) {
                return Some(candidate);
            }
        }
        None
    }

    /// 指定オフセットから指定バイト数だけ部分的にバイナリデータを読み込み
    fn read_binary_range(&self, path: &str, offset: u64, length: usize) -> io::Result<Vec<u8>> {
        let data = self.read_binary(path)?;
        let start = offset as usize;
        if start >= data.len() {
            return Ok(Vec::new());
        }
        let end = (start + length).min(data.len());
        Ok(data[start..end].to_vec())
    }
}

/// 単純なワイルドカードパターン（`*` と `?`）のマッチング関数
pub fn wildcard_match(pattern: &str, text: &str) -> bool {
    let p_bytes = pattern.as_bytes();
    let t_bytes = text.as_bytes();
    let p_len = p_bytes.len();
    let t_len = t_bytes.len();

    let mut p_idx = 0;
    let mut t_idx = 0;
    let mut star_idx = None;
    let mut match_idx = 0;

    while t_idx < t_len {
        if p_idx < p_len && (p_bytes[p_idx] == b'?' || p_bytes[p_idx] == t_bytes[t_idx]) {
            p_idx += 1;
            t_idx += 1;
        } else if p_idx < p_len && p_bytes[p_idx] == b'*' {
            star_idx = Some(p_idx);
            match_idx = t_idx;
            p_idx += 1;
        } else if let Some(star) = star_idx {
            p_idx = star + 1;
            match_idx += 1;
            t_idx = match_idx;
        } else {
            return false;
        }
    }

    while p_idx < p_len && p_bytes[p_idx] == b'*' {
        p_idx += 1;
    }

    p_idx == p_len
}

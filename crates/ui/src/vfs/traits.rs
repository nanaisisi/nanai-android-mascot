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
}

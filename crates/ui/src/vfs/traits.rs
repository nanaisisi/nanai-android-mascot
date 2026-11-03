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
}

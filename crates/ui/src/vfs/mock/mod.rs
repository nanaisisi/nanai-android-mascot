//! メモリベースのインメモリ仮想ファイルシステム (MockVfs) モジュール

pub mod mutations;
pub mod queries;
pub mod vfs_trait;

use std::collections::HashMap;

/// メモリベースのインメモリ仮想ファイルシステム（スタブ・テスト・WASM用）
///
/// 大文字・小文字の表記揺れおよび `/` と `\` のパスセパレータを吸収し、
/// ファイルの追加・参照・デコード・一覧取得を提供します。
#[derive(Debug, Clone, Default)]
pub struct MockVfs {
    /// 正規化・小文字化した相対パス -> (オリジナルの相対パス, バイト列)
    pub(crate) files: HashMap<String, (String, Vec<u8>)>,
}

impl MockVfs {
    /// 新規 `MockVfs` インスタンスを生成
    pub fn new() -> Self {
        Self {
            files: HashMap::new(),
        }
    }
}

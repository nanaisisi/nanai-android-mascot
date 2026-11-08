//! テキストファイル自動判定読み込み I/O モジュール

use super::charset::detect_and_decode;
use std::io;
use std::path::Path;

/// テキストファイルを自動判定（UTF-8 / BOM / Shift_JIS / EUC-JP / UTF-16）で開き、UTF-8文字列として返す
pub fn open_text_file(path: &Path) -> Result<String, io::Error> {
    let buffer = std::fs::read(path)?;
    let (decoded, _) = detect_and_decode(&buffer);
    Ok(decoded)
}

/// 後方互換用エイリアス
pub fn open_shift_jis_file(path: &str) -> Result<String, io::Error> {
    open_text_file(Path::new(path))
}

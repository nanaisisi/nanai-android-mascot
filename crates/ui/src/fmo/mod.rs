//! FMO (File Mapping Object) & Mutex 実装（ukadoc-spec / fmo-mutex 準拠）
//!
//! Windows FMO 形式の共有メモリバッファ (64KB, Little-Endian 先頭サイズ, `\x01` キー値区切り, CRLF 行区切り, NULL終端)
//! の生成および解析を行う。
//! モバイル (Android/マルチプラットフォーム) 環境における省メモリ・バックグラウンド生存状態の同期に対応。

pub mod buffer;
pub mod types;

pub use buffer::*;
pub use types::*;

#[cfg(test)]
mod tests;

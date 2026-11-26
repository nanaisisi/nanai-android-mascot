//! シェル読込ランタイムモデル（ukadoc-spec / descript / shell 準拠）
//!
//! シェルディレクトリから `descript.txt` / `surfaces.txt` / `surfacetable.txt`
//! を読み込み（Shift_JIS / UTF-8 自動判別・VFS 大文字小文字吸収）、
//! 描画・当たり判定・着せ替え解決に使う構造体にまとめる。

pub mod core;
pub mod loader;

#[cfg(test)]
mod tests;

pub use core::Shell;

//! `surfaces.txt` 全体構造体定義・ディープマージモジュール

pub mod definition;
pub mod merge;

#[cfg(test)]
mod tests;

pub use definition::SurfacesTxt;

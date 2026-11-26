//! `surfaces.txt` (UKADOC / SSP 仕様準拠) 高速パーサーモジュール
//! サーフィス定義、要素レイヤー、アニメーション、衝突判定領域を一括パース

mod parser;
mod types;

pub use parser::*;
pub use types::*;

#[cfg(test)]
mod tests;

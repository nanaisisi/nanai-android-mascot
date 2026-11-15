//! descript.txt (UKADOC / SSP 仕様準拠) 高速パーサー & プロパティ辞書エンジン

mod parser;
mod types;

pub use parser::*;
pub use types::*;

#[cfg(test)]
mod tests;

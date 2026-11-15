//! さくらスクリプト (Sakura Script) 高速パーサー
//! UKADOC (SSP仕様) 準拠のトークナイザー / AST 生成モジュール

pub mod env;
pub mod parser;
pub mod types;

pub use env::*;
pub use parser::*;
pub use types::*;

#[cfg(test)]
mod tests;

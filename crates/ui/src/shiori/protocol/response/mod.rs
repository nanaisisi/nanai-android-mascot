//! SHIORI/3.0 レスポンスの型・コンストラクタ・パース補助関数モジュール

pub mod build;
pub mod helpers;
pub mod parse;
pub mod types;

pub(crate) use helpers::*;
pub use types::ShioriResponse;

#[cfg(test)]
mod tests;

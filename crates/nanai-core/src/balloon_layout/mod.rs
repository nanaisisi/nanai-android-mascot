//! バルーンテキスト自動折り返し & レイアウトメトリクス演算エンジン (UKADOC / SSP 準拠)

mod text_layout;
mod types;
mod validrect;

pub use text_layout::*;
pub use types::*;
pub use validrect::*;

#[cfg(test)]
mod tests;

//! `surfaces.txt` 構文解析パーサー（ブロック判定・行ルート振り分け）

pub mod handlers;
pub mod helpers;
pub mod main_parser;

#[cfg(test)]
pub mod tests;

pub use handlers::expand_range;
pub use main_parser::parse_surfaces_txt;

//! `descript.txt` パーサモジュール

pub mod parser;
pub mod types;

#[cfg(test)]
mod tests;

pub use parser::Descript;
pub use types::{BindGroup, BindOptionGroup, CharDefaults};

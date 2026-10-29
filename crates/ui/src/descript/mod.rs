//! `descript.txt` パーサモジュール

pub mod types;
pub mod parser;

#[cfg(test)]
mod tests;

pub use types::{BindGroup, BindOptionGroup, CharDefaults};
pub use parser::Descript;

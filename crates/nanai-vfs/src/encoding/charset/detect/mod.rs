//! バイト列からの文字コード自動判定・デコードモジュール

mod bom;
mod core;
mod header_decl;

pub use core::{detect_and_decode, detect_and_decode_ext};

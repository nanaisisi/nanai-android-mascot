//! VFS 文字コード自動判定・エンコーディング・改行コード正規化・MIME判定モジュール

pub mod charset;
pub mod file_io;
pub mod mime;
pub mod newlines;

pub use charset::{
    DecodeResult, detect_and_decode, detect_and_decode_ext, encode_to_charset,
    normalize_charset_name,
};
pub use file_io::{open_shift_jis_file, open_text_file};
pub use mime::detect_mime_type;
pub use newlines::{denormalize_newlines, normalize_newlines};

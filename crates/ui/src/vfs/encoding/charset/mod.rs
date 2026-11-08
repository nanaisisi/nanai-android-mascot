//! VFS 文字コード自動判定（Shift_JIS, EUC-JP, ISO-2022-JP, UTF-8/16）および相互変換処理モジュール

pub mod detect;
pub mod encode;
pub mod names;

pub use detect::{detect_and_decode, detect_and_decode_ext};
pub use encode::encode_to_charset;
pub use names::{DecodeResult, normalize_charset_name};

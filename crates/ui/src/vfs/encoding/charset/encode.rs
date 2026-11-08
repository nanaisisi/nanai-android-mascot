//! 指定文字コードへのエンコードモジュール

use super::names::normalize_charset_name;
use encoding_rs::{EUC_JP, ISO_2022_JP, SHIFT_JIS};

/// 文字列を指定された文字コード名にエンコード
pub fn encode_to_charset(text: &str, charset: &str) -> Option<Vec<u8>> {
    let normalized = normalize_charset_name(charset)?;
    match normalized {
        "Shift_JIS" => {
            let (cow, _, had_errors) = SHIFT_JIS.encode(text);
            if had_errors {
                None
            } else {
                Some(cow.into_owned())
            }
        }
        "EUC-JP" => {
            let (cow, _, had_errors) = EUC_JP.encode(text);
            if had_errors {
                None
            } else {
                Some(cow.into_owned())
            }
        }
        "ISO-2022-JP" => {
            let (cow, _, had_errors) = ISO_2022_JP.encode(text);
            if had_errors {
                None
            } else {
                Some(cow.into_owned())
            }
        }
        "UTF-8" => Some(text.as_bytes().to_vec()),
        "UTF-16LE" => {
            let mut out = Vec::new();
            for u in text.encode_utf16() {
                out.extend_from_slice(&u.to_le_bytes());
            }
            Some(out)
        }
        "UTF-16BE" => {
            let mut out = Vec::new();
            for u in text.encode_utf16() {
                out.extend_from_slice(&u.to_be_bytes());
            }
            Some(out)
        }
        _ => None,
    }
}

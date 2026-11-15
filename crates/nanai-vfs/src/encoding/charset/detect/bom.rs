//! バイト列の BOM (Byte Order Mark) 判定およびデコード処理

use super::super::names::DecodeResult;
use encoding_rs::{UTF_16BE, UTF_16LE};

/// BOM に基づくデコード処理（BOM が存在する場合は Some(DecodeResult) を返す）
pub(crate) fn try_decode_bom(buffer: &[u8]) -> Option<DecodeResult> {
    // 1-1. UTF-8 BOM チェック (0xEF, 0xBB, 0xBF)
    if buffer.starts_with(&[0xEF, 0xBB, 0xBF]) {
        match std::str::from_utf8(&buffer[3..]) {
            Ok(utf8_str) => {
                return Some(DecodeResult {
                    text: utf8_str.to_string(),
                    encoding: "UTF-8 (BOM)",
                    had_errors: false,
                });
            }
            Err(_) => {
                let text = String::from_utf8_lossy(&buffer[3..]).to_string();
                return Some(DecodeResult {
                    text,
                    encoding: "UTF-8 (BOM)",
                    had_errors: true,
                });
            }
        }
    }

    // 1-2. UTF-32LE BOM チェック (0xFF, 0xFE, 0x00, 0x00)
    if buffer.starts_with(&[0xFF, 0xFE, 0x00, 0x00]) {
        let u32_bytes = &buffer[4..];
        let mut chars = Vec::new();
        let mut had_errors = false;
        #[allow(clippy::chunks_exact_to_as_chunks)]
        for chunk in u32_bytes.chunks_exact(4) {
            let code = u32::from_le_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]);
            match char::from_u32(code) {
                Some(c) => chars.push(c),
                None => {
                    chars.push('\u{FFFD}');
                    had_errors = true;
                }
            }
        }
        if u32_bytes.len() % 4 != 0 {
            had_errors = true;
        }
        return Some(DecodeResult {
            text: chars.into_iter().collect(),
            encoding: "UTF-32LE",
            had_errors,
        });
    }

    // 1-3. UTF-16LE BOM チェック (0xFF, 0xFE)
    if buffer.starts_with(&[0xFF, 0xFE]) {
        let (cow, _, had_errors) = UTF_16LE.decode(&buffer[2..]);
        if !had_errors {
            return Some(DecodeResult {
                text: cow.into_owned(),
                encoding: "UTF-16LE",
                had_errors: false,
            });
        }
    }

    // 1-4. UTF-32BE BOM チェック (0x00, 0x00, 0xFE, 0xFF)
    if buffer.starts_with(&[0x00, 0x00, 0xFE, 0xFF]) {
        let u32_bytes = &buffer[4..];
        let mut chars = Vec::new();
        let mut had_errors = false;
        #[allow(clippy::chunks_exact_to_as_chunks)]
        for chunk in u32_bytes.chunks_exact(4) {
            let code = u32::from_be_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]);
            match char::from_u32(code) {
                Some(c) => chars.push(c),
                None => {
                    chars.push('\u{FFFD}');
                    had_errors = true;
                }
            }
        }
        if u32_bytes.len() % 4 != 0 {
            had_errors = true;
        }
        return Some(DecodeResult {
            text: chars.into_iter().collect(),
            encoding: "UTF-32BE",
            had_errors,
        });
    }

    // 1-5. UTF-16BE BOM チェック (0xFE, 0xFF)
    if buffer.starts_with(&[0xFE, 0xFF]) {
        let (cow, _, had_errors) = UTF_16BE.decode(&buffer[2..]);
        if !had_errors {
            return Some(DecodeResult {
                text: cow.into_owned(),
                encoding: "UTF-16BE",
                had_errors: false,
            });
        }
    }

    None
}

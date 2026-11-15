//! テキスト先頭部分の文字コード宣言 (charset=..., encoding=...) および JIS エスケープシーケンス判定

use super::super::names::{DecodeResult, normalize_charset_name};
use encoding_rs::{EUC_JP, ISO_2022_JP, SHIFT_JIS, UTF_16BE, UTF_16LE};

/// ヘッダー宣言または JIS エスケープシーケンスに基づくデコード試行
pub(crate) fn try_decode_header_decl(buffer: &[u8]) -> Option<DecodeResult> {
    // 2. ヘッダー宣言チェック (charset,Shift_JIS / charset=Shift_JIS / charset:Shift_JIS / encoding=... 等)
    let check_len = buffer.len().min(1024);
    let slice = &buffer[..check_len];
    let lower_ascii: Vec<u8> = slice.iter().map(|b| b.to_ascii_lowercase()).collect();

    let mut found_charset_decl = None;
    for sep in [
        &b"charset,"[..],
        &b"charset="[..],
        &b"charset:"[..],
        &b"charset\t"[..],
        &b"encoding="[..],
        &b"encoding:"[..],
    ] {
        if let Some(pos) = lower_ascii.windows(sep.len()).position(|w| w == sep) {
            let remainder = &lower_ascii[pos + sep.len()..];
            let end = remainder
                .iter()
                .position(|&b| {
                    b == b'\r' || b == b'\n' || b == b',' || b == b';' || b == b' ' || b == b'\t'
                })
                .unwrap_or(remainder.len());
            let raw_decl = String::from_utf8_lossy(&remainder[..end]);
            let charset_decl = raw_decl
                .trim()
                .trim_matches(|c| c == '"' || c == '\'')
                .to_string();
            if !charset_decl.is_empty() {
                found_charset_decl = Some(charset_decl);
                break;
            }
        }
    }

    if let Some(decl) = found_charset_decl
        && let Some(normalized) = normalize_charset_name(&decl)
    {
        match normalized {
            "Shift_JIS" => {
                if let Ok(utf8_str) = std::str::from_utf8(buffer) {
                    let (cow, _, had_errors) = SHIFT_JIS.decode(buffer);
                    if had_errors || cow.contains('\u{FFFD}') {
                        return Some(DecodeResult {
                            text: utf8_str.to_string(),
                            encoding: "UTF-8",
                            had_errors: false,
                        });
                    }
                    return Some(DecodeResult {
                        text: cow.into_owned(),
                        encoding: "Shift_JIS",
                        had_errors,
                    });
                }
                let (cow, _, had_errors) = SHIFT_JIS.decode(buffer);
                return Some(DecodeResult {
                    text: cow.into_owned(),
                    encoding: "Shift_JIS",
                    had_errors,
                });
            }
            "EUC-JP" => {
                let (cow, _, had_errors) = EUC_JP.decode(buffer);
                return Some(DecodeResult {
                    text: cow.into_owned(),
                    encoding: "EUC-JP",
                    had_errors,
                });
            }
            "ISO-2022-JP" => {
                let (cow, _, had_errors) = ISO_2022_JP.decode(buffer);
                return Some(DecodeResult {
                    text: cow.into_owned(),
                    encoding: "ISO-2022-JP",
                    had_errors,
                });
            }
            "UTF-8" => {
                let (cow, _, had_errors) = encoding_rs::UTF_8.decode(buffer);
                return Some(DecodeResult {
                    text: cow.into_owned(),
                    encoding: "UTF-8",
                    had_errors,
                });
            }
            "UTF-16LE" => {
                let (cow, _, had_errors) = UTF_16LE.decode(buffer);
                return Some(DecodeResult {
                    text: cow.into_owned(),
                    encoding: "UTF-16LE",
                    had_errors,
                });
            }
            "UTF-16BE" => {
                let (cow, _, had_errors) = UTF_16BE.decode(buffer);
                return Some(DecodeResult {
                    text: cow.into_owned(),
                    encoding: "UTF-16BE",
                    had_errors,
                });
            }
            _ => {}
        }
    }

    // 2-2. ISO-2022-JP (JISエスケープシーケンス) チェック
    if buffer
        .windows(3)
        .any(|w| w == [0x1B, 0x24, 0x42] || w == [0x1B, 0x24, 0x40] || w == [0x1B, 0x28, 0x4A])
    {
        let (cow, _, had_errors) = ISO_2022_JP.decode(buffer);
        if !had_errors {
            return Some(DecodeResult {
                text: cow.into_owned(),
                encoding: "ISO-2022-JP",
                had_errors: false,
            });
        }
    }

    None
}

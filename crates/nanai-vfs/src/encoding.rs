use encoding_rs::{EUC_JP, ISO_2022_JP, SHIFT_JIS, UTF_16BE, UTF_16LE};
use std::io;
use std::path::Path;

/// デコード結果の詳細情報
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DecodeResult {
    /// デコードされた文字列
    pub text: String,
    /// 判定された文字コード名（"UTF-8", "UTF-8 (BOM)", "Shift_JIS", "EUC-JP", "ISO-2022-JP", "UTF-16LE", "UTF-16BE"）
    pub encoding: &'static str,
    /// 不正な文字シーケンスや置換文字が発生したか
    pub had_errors: bool,
}

/// 詳細なデコード結果（エラー有無を含む）を返す拡張自動判定関数
pub fn detect_and_decode_ext(buffer: &[u8]) -> DecodeResult {
    // 1. BOM チェック
    // 1-1. UTF-8 BOM チェック (0xEF, 0xBB, 0xBF)
    if buffer.starts_with(&[0xEF, 0xBB, 0xBF]) {
        match std::str::from_utf8(&buffer[3..]) {
            Ok(utf8_str) => {
                return DecodeResult {
                    text: utf8_str.to_string(),
                    encoding: "UTF-8 (BOM)",
                    had_errors: false,
                };
            }
            Err(_) => {
                let text = String::from_utf8_lossy(&buffer[3..]).to_string();
                return DecodeResult {
                    text,
                    encoding: "UTF-8 (BOM)",
                    had_errors: true,
                };
            }
        }
    }

    // 1-2. UTF-16LE BOM チェック (0xFF, 0xFE)
    if buffer.starts_with(&[0xFF, 0xFE]) {
        let (cow, _, had_errors) = UTF_16LE.decode(&buffer[2..]);
        if !had_errors {
            return DecodeResult {
                text: cow.into_owned(),
                encoding: "UTF-16LE",
                had_errors: false,
            };
        }
    }

    // 1-3. UTF-16BE BOM チェック (0xFE, 0xFF)
    if buffer.starts_with(&[0xFE, 0xFF]) {
        let (cow, _, had_errors) = UTF_16BE.decode(&buffer[2..]);
        if !had_errors {
            return DecodeResult {
                text: cow.into_owned(),
                encoding: "UTF-16BE",
                had_errors: false,
            };
        }
    }

    // 2. ヘッダー宣言チェック
    let check_len = buffer.len().min(1024);
    let slice = &buffer[..check_len];
    let lower_ascii: Vec<u8> = slice.iter().map(|b| b.to_ascii_lowercase()).collect();

    let mut found_charset_decl = None;
    for sep in [b"charset,", b"charset=", b"charset:"] {
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

    if let Some(decl) = found_charset_decl {
        match decl.as_str() {
            "shift_jis" | "shift-jis" | "sjis" | "cp932" | "windows-31j" => {
                let (cow, _, had_errors) = SHIFT_JIS.decode(buffer);
                return DecodeResult {
                    text: cow.into_owned(),
                    encoding: "Shift_JIS",
                    had_errors,
                };
            }
            "euc-jp" | "euc_jp" | "ujis" | "x-euc-jp" => {
                let (cow, _, had_errors) = EUC_JP.decode(buffer);
                return DecodeResult {
                    text: cow.into_owned(),
                    encoding: "EUC-JP",
                    had_errors,
                };
            }
            "iso-2022-jp" | "iso2022jp" | "jis" => {
                let (cow, _, had_errors) = ISO_2022_JP.decode(buffer);
                return DecodeResult {
                    text: cow.into_owned(),
                    encoding: "ISO-2022-JP",
                    had_errors,
                };
            }
            "utf-8" | "utf8" => {
                let (cow, _, had_errors) = encoding_rs::UTF_8.decode(buffer);
                return DecodeResult {
                    text: cow.into_owned(),
                    encoding: "UTF-8",
                    had_errors,
                };
            }
            _ => {}
        }
    }

    if buffer.windows(3).any(|w| {
        w == [0x1B, 0x24, 0x42]
            || w == [0x1B, 0x24, 0x40]
            || w == [0x1B, 0x28, 0x4A]
    }) {
        let (cow, _, had_errors) = ISO_2022_JP.decode(buffer);
        if !had_errors {
            return DecodeResult {
                text: cow.into_owned(),
                encoding: "ISO-2022-JP",
                had_errors: false,
            };
        }
    }

    if let Ok(utf8_str) = std::str::from_utf8(buffer) {
        return DecodeResult {
            text: utf8_str.to_string(),
            encoding: "UTF-8",
            had_errors: false,
        };
    }

    let (euc_cow, _, euc_errors) = EUC_JP.decode(buffer);
    if !euc_errors && buffer.iter().any(|&b| b >= 0x80) {
        let (sjis_cow, _, sjis_errors) = SHIFT_JIS.decode(buffer);
        if sjis_errors && !euc_errors {
            return DecodeResult {
                text: euc_cow.into_owned(),
                encoding: "EUC-JP",
                had_errors: false,
            };
        }
        if !sjis_errors {
            return DecodeResult {
                text: sjis_cow.into_owned(),
                encoding: "Shift_JIS",
                had_errors: false,
            };
        }
    }

    let (cow, _, had_errors) = SHIFT_JIS.decode(buffer);
    DecodeResult {
        text: cow.into_owned(),
        encoding: "Shift_JIS",
        had_errors,
    }
}

pub fn detect_and_decode(buffer: &[u8]) -> (String, &'static str) {
    let res = detect_and_decode_ext(buffer);
    (res.text, res.encoding)
}

pub fn open_text_file(path: &Path) -> Result<String, io::Error> {
    let buffer = std::fs::read(path)?;
    let (decoded, _) = detect_and_decode(&buffer);
    Ok(decoded)
}

pub fn open_shift_jis_file(path: &str) -> Result<String, io::Error> {
    open_text_file(Path::new(path))
}

pub fn encode_to_charset(text: &str, charset: &str) -> Option<Vec<u8>> {
    let clean = charset
        .trim()
        .trim_matches(|c| c == '"' || c == '\'')
        .to_lowercase();
    match clean.as_str() {
        "shift_jis" | "shift-jis" | "sjis" | "cp932" | "windows-31j" => {
            let (cow, _, had_errors) = SHIFT_JIS.encode(text);
            if had_errors { None } else { Some(cow.into_owned()) }
        }
        "euc-jp" | "euc_jp" | "ujis" | "x-euc-jp" => {
            let (cow, _, had_errors) = EUC_JP.encode(text);
            if had_errors { None } else { Some(cow.into_owned()) }
        }
        "iso-2022-jp" | "iso2022jp" | "jis" => {
            let (cow, _, had_errors) = ISO_2022_JP.encode(text);
            if had_errors { None } else { Some(cow.into_owned()) }
        }
        "utf-8" | "utf8" => Some(text.as_bytes().to_vec()),
        "utf-16le" | "utf-16" | "utf16le" => {
            let mut out = Vec::new();
            for u in text.encode_utf16() {
                out.extend_from_slice(&u.to_le_bytes());
            }
            Some(out)
        }
        "utf-16be" | "utf16be" => {
            let mut out = Vec::new();
            for u in text.encode_utf16() {
                out.extend_from_slice(&u.to_be_bytes());
            }
            Some(out)
        }
        _ => None,
    }
}

pub fn normalize_newlines(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut chars = text.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '\r' {
            if chars.peek() == Some(&'\n') {
                chars.next();
            }
            result.push('\n');
        } else {
            result.push(ch);
        }
    }
    result
}

pub fn detect_mime_type(path: &str) -> &'static str {
    let lower = path.to_lowercase();
    if lower.ends_with(".png") {
        "image/png"
    } else if lower.ends_with(".pna") {
        "image/x-nar-pna"
    } else if lower.ends_with(".bmp") {
        "image/bmp"
    } else if lower.ends_with(".jpg") || lower.ends_with(".jpeg") {
        "image/jpeg"
    } else if lower.ends_with(".gif") {
        "image/gif"
    } else if lower.ends_with(".webp") {
        "image/webp"
    } else if lower.ends_with(".txt") {
        "text/plain"
    } else if lower.ends_with(".json") {
        "application/json"
    } else if lower.ends_with(".zip") || lower.ends_with(".nar") {
        "application/zip"
    } else {
        "application/octet-stream"
    }
}

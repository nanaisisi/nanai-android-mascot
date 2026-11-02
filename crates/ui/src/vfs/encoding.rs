use encoding_rs::{EUC_JP, ISO_2022_JP, SHIFT_JIS, UTF_16BE, UTF_16LE};
use std::io;
use std::path::Path;

/// バイト列から文字コードを自動判定（UTF-8 BOM / UTF-16 BOM / ヘッダー宣言 / UTF-8 / EUC-JP / Shift_JIS・CP932）してデコードし、
/// デコード後の文字列と判定された文字コード名を返す。
pub fn detect_and_decode(buffer: &[u8]) -> (String, &'static str) {
    // 1. BOM チェック
    // 1-1. UTF-8 BOM チェック (0xEF, 0xBB, 0xBF)
    if buffer.starts_with(&[0xEF, 0xBB, 0xBF])
        && let Ok(utf8_str) = std::str::from_utf8(&buffer[3..])
    {
        return (utf8_str.to_string(), "UTF-8 (BOM)");
    }

    // 1-2. UTF-16LE BOM チェック (0xFF, 0xFE)
    if buffer.starts_with(&[0xFF, 0xFE]) {
        let (cow, _, had_errors) = UTF_16LE.decode(&buffer[2..]);
        if !had_errors {
            return (cow.into_owned(), "UTF-16LE");
        }
    }

    // 1-3. UTF-16BE BOM チェック (0xFE, 0xFF)
    if buffer.starts_with(&[0xFE, 0xFF]) {
        let (cow, _, had_errors) = UTF_16BE.decode(&buffer[2..]);
        if !had_errors {
            return (cow.into_owned(), "UTF-16BE");
        }
    }

    // 2. ヘッダー宣言チェック (charset,Shift_JIS / charset,CP932 / charset,UTF-8 / charset,EUC-JP 等)
    // 最初の1024バイト程度をチェック
    let check_len = buffer.len().min(1024);
    let slice = &buffer[..check_len];
    let lower_ascii: Vec<u8> = slice.iter().map(|b| b.to_ascii_lowercase()).collect();

    if let Some(pos) = lower_ascii.windows(8).position(|w| w == b"charset,") {
        let remainder = &lower_ascii[pos + 8..];
        let end = remainder
            .iter()
            .position(|&b| b == b'\r' || b == b'\n' || b == b',' || b == b';')
            .unwrap_or(remainder.len());
        let raw_decl = String::from_utf8_lossy(&remainder[..end]);
        let charset_decl = raw_decl.trim().trim_matches(|c| c == '"' || c == '\'');

        if charset_decl == "shift_jis"
            || charset_decl == "shift-jis"
            || charset_decl == "sjis"
            || charset_decl == "cp932"
            || charset_decl == "windows-31j"
        {
            let (cow, _, had_errors) = SHIFT_JIS.decode(buffer);
            if had_errors {
                eprintln!("Warning: Some Shift_JIS characters couldn't be decoded properly");
            }
            return (cow.into_owned(), "Shift_JIS");
        } else if charset_decl == "euc-jp"
            || charset_decl == "euc_jp"
            || charset_decl == "ujis"
            || charset_decl == "x-euc-jp"
        {
            let (cow, _, had_errors) = EUC_JP.decode(buffer);
            if had_errors {
                eprintln!("Warning: Some EUC-JP characters couldn't be decoded properly");
            }
            return (cow.into_owned(), "EUC-JP");
        } else if charset_decl == "iso-2022-jp"
            || charset_decl == "iso2022jp"
            || charset_decl == "jis"
        {
            let (cow, _, had_errors) = ISO_2022_JP.decode(buffer);
            if had_errors {
                eprintln!("Warning: Some ISO-2022-JP characters couldn't be decoded properly");
            }
            return (cow.into_owned(), "ISO-2022-JP");
        } else if (charset_decl == "utf-8" || charset_decl == "utf8")
            && let Ok(utf8_str) = std::str::from_utf8(buffer)
        {
            return (utf8_str.to_string(), "UTF-8");
        }
    }

    // 2-2. ISO-2022-JP (JISエスケープシーケンス ESC $ B / ESC ( B 等) チェック
    if buffer.windows(3).any(|w| {
        w == [0x1B, 0x24, 0x42] // ESC $ B (JIS X 0208-1983)
            || w == [0x1B, 0x24, 0x40] // ESC $ @ (JIS X 0208-1978)
            || w == [0x1B, 0x28, 0x4A] // ESC ( J (JIS X 0201 Roman)
    }) {
        let (cow, _, had_errors) = ISO_2022_JP.decode(buffer);
        if !had_errors {
            return (cow.into_owned(), "ISO-2022-JP");
        }
    }

    // 3. 標準 UTF-8 としてのパース試行
    if let Ok(utf8_str) = std::str::from_utf8(buffer) {
        return (utf8_str.to_string(), "UTF-8");
    }

    // 4. EUC-JP パース試行（有効なEUC-JPでエラーなしの場合）
    let (euc_cow, _, euc_errors) = EUC_JP.decode(buffer);
    if !euc_errors && buffer.iter().any(|&b| b >= 0x80) {
        let (sjis_cow, _, sjis_errors) = SHIFT_JIS.decode(buffer);
        if sjis_errors && !euc_errors {
            return (euc_cow.into_owned(), "EUC-JP");
        }
        if !sjis_errors {
            return (sjis_cow.into_owned(), "Shift_JIS");
        }
    }

    // 5. Shift_JIS / CP932 フォールバックデコード
    let (cow, _encoding_used, had_errors) = SHIFT_JIS.decode(buffer);
    if had_errors {
        eprintln!("Warning: Some Shift_JIS characters couldn't be decoded properly");
    }

    (cow.into_owned(), "Shift_JIS")
}

/// テキストファイルを自動判定（UTF-8 / BOM / Shift_JIS / EUC-JP / UTF-16）で開き、UTF-8文字列として返す
pub fn open_text_file(path: &Path) -> Result<String, io::Error> {
    let buffer = std::fs::read(path)?;
    let (decoded, _) = detect_and_decode(&buffer);
    Ok(decoded)
}

/// 後方互換用エイリアス
pub fn open_shift_jis_file(path: &str) -> Result<String, io::Error> {
    open_text_file(Path::new(path))
}

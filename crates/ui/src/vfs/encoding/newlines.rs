//! 改行コード正規化・復元モジュール

/// CRLF / CR / LF の改行コードをすべて単一の LF (`\n`) に正規化
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

/// LF (`\n`) 改行コードを指定された改行シーケンス（CRLF `\r\n` や CR `\r`）に復元
pub fn denormalize_newlines(text: &str, newline_seq: &str) -> String {
    let normalized = normalize_newlines(text);
    if newline_seq == "\n" {
        return normalized;
    }
    normalized.replace('\n', newline_seq)
}

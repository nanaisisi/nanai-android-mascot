//! 文字コード自動判定結果データ構造および文字コード名正規化モジュール

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

/// 文字コード名を標準的なキー表現に正規化（例: "cp932", "sjis", "windows-31j" -> "Shift_JIS"）
pub fn normalize_charset_name(charset: &str) -> Option<&'static str> {
    let clean = charset
        .trim()
        .trim_matches(|c| c == '"' || c == '\'')
        .to_ascii_lowercase();
    match clean.as_str() {
        "shift_jis" | "shift-jis" | "sjis" | "cp932" | "windows-31j" | "ms932" | "x-sjis" => {
            Some("Shift_JIS")
        }
        "euc-jp" | "euc_jp" | "ujis" | "x-euc-jp" => Some("EUC-JP"),
        "iso-2022-jp" | "iso2022jp" | "jis" | "csiso2022jp" => Some("ISO-2022-JP"),
        "utf-8" | "utf8" | "utf_8" => Some("UTF-8"),
        "utf-16le" | "utf-16" | "utf16le" | "utf16" => Some("UTF-16LE"),
        "utf-16be" | "utf16be" => Some("UTF-16BE"),
        _ => None,
    }
}

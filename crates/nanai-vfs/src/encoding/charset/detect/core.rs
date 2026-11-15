//! 文字コード自動判定およびデコードのエントリポイント

use super::super::names::DecodeResult;
use super::bom::try_decode_bom;
use super::header_decl::try_decode_header_decl;
use encoding_rs::{EUC_JP, SHIFT_JIS};

/// 詳細なデコード結果（エラー有無を含む）を返す拡張自動判定関数
pub fn detect_and_decode_ext(buffer: &[u8]) -> DecodeResult {
    // 1. BOM チェック
    if let Some(res) = try_decode_bom(buffer) {
        return res;
    }

    // 2. ヘッダー宣言および JIS エスケープシーケンスチェック
    if let Some(res) = try_decode_header_decl(buffer) {
        return res;
    }

    // 3. 標準 UTF-8 パース試行
    if let Ok(utf8_str) = std::str::from_utf8(buffer) {
        return DecodeResult {
            text: utf8_str.to_string(),
            encoding: "UTF-8",
            had_errors: false,
        };
    }

    // 4. EUC-JP パース試行
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

    // 5. Shift_JIS / CP932 フォールバックデコード
    let (cow, _encoding_used, had_errors) = SHIFT_JIS.decode(buffer);
    DecodeResult {
        text: cow.into_owned(),
        encoding: "Shift_JIS",
        had_errors,
    }
}

/// バイト列から文字コードを自動判定してデコードし、(文字列, 文字コード名) を返す
pub fn detect_and_decode(buffer: &[u8]) -> (String, &'static str) {
    let res = detect_and_decode_ext(buffer);
    (res.text().to_string(), res.encoding())
}

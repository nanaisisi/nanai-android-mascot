use super::super::*;
use encoding_rs::{ISO_2022_JP, SHIFT_JIS};

#[test]
fn test_iso_2022_jp_and_quoted_charset_headers() {
    // Quoted charset in header
    let quoted_sjis = "charset,\"Shift_JIS\"\r\nname,クォートSJIS";
    let (sjis_bytes, _, _) = SHIFT_JIS.encode(quoted_sjis);
    let (decoded_q_sjis, enc_q_sjis) = detect_and_decode(&sjis_bytes);
    assert_eq!(decoded_q_sjis, quoted_sjis);
    assert_eq!(enc_q_sjis, "Shift_JIS");

    let single_quoted_utf8 = "charset, 'UTF-8' \r\nname,SingleQuoteUTF8";
    let (decoded_q_utf8, enc_q_utf8) = detect_and_decode(single_quoted_utf8.as_bytes());
    assert_eq!(decoded_q_utf8, single_quoted_utf8);
    assert_eq!(enc_q_utf8, "UTF-8");

    // Header declared ISO-2022-JP
    let header_jis = "charset,ISO-2022-JP\r\nname,JISゴースト";
    let (jis_bytes, _, _) = ISO_2022_JP.encode(header_jis);
    let (decoded_jis, enc_jis) = detect_and_decode(&jis_bytes);
    assert_eq!(decoded_jis, header_jis);
    assert_eq!(enc_jis, "ISO-2022-JP");

    // Raw ISO-2022-JP with escape sequence without charset declaration
    let raw_jis_text = "こんにちは世界 (JIS)";
    let (raw_jis_bytes, _, _) = ISO_2022_JP.encode(raw_jis_text);
    let (decoded_raw, enc_raw) = detect_and_decode(&raw_jis_bytes);
    assert_eq!(decoded_raw, raw_jis_text);
    assert_eq!(enc_raw, "ISO-2022-JP");
}

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

#[test]
fn test_encoding_edge_cases() {
    assert!(encode_to_charset("test", "unknown_charset").is_none());
    assert!(encode_to_charset("🚀", "shift_jis").is_none());

    let normalized = normalize_newlines("line1\r\nline2\rline3\nline4");
    assert_eq!(normalized, "line1\nline2\nline3\nline4");

    assert!(encode_to_charset("test", "utf-16le").is_some());
    assert!(encode_to_charset("test", "utf-16be").is_some());

    // Cycle 6: detect_and_decode_ext & headers with '=' and ':'
    let eq_header = b"charset=Shift_JIS\r\nname=EquTest";
    let res_eq = detect_and_decode_ext(eq_header);
    assert_eq!(res_eq.encoding, "Shift_JIS");
    assert!(!res_eq.had_errors);

    let colon_header = b"charset:utf-8\r\nname:ColonTest";
    let res_colon = detect_and_decode_ext(colon_header);
    assert_eq!(res_colon.encoding, "UTF-8");
    assert!(!res_colon.had_errors);

    // detect_mime_type
    assert_eq!(detect_mime_type("surface0.png"), "image/png");
    assert_eq!(detect_mime_type("surface0.pna"), "image/x-nar-pna");
    assert_eq!(detect_mime_type("surface0.bmp"), "image/bmp");
    assert_eq!(detect_mime_type("descript.txt"), "text/plain");
    assert_eq!(detect_mime_type("info.json"), "application/json");
    assert_eq!(detect_mime_type("sound.wav"), "audio/wav");
    assert_eq!(detect_mime_type("music.mp3"), "audio/mpeg");
    assert_eq!(detect_mime_type("bgm.ogg"), "audio/ogg");
    assert_eq!(detect_mime_type("song.mid"), "audio/midi");
    assert_eq!(detect_mime_type("archive.zip"), "application/zip");
    assert_eq!(detect_mime_type("ghost.nar"), "application/zip");
    assert_eq!(detect_mime_type("shiori.dll"), "application/octet-stream");
    assert_eq!(detect_mime_type("unknown.xyz"), "application/octet-stream");
}

#[test]
fn test_encoding_uncovered_branches() {
    let bad_utf16le = vec![0xFF, 0xFE, 0x00];
    let (dec_le, _) = detect_and_decode(&bad_utf16le);
    assert!(!dec_le.is_empty());

    let bad_utf16be = vec![0xFE, 0xFF, 0x00];
    let (dec_be, _) = detect_and_decode(&bad_utf16be);
    assert!(!dec_be.is_empty());

    let bad_sjis_header = b"charset,shift_jis\r\n\xff\xff\xff";
    let (_, enc_sjis_err) = detect_and_decode(bad_sjis_header);
    assert_eq!(enc_sjis_err, "Shift_JIS");

    let bad_euc_header = b"charset,euc-jp\r\n\xff\xff\xff";
    let (_, enc_euc_err) = detect_and_decode(bad_euc_header);
    assert_eq!(enc_euc_err, "EUC-JP");

    let bad_jis_header = b"charset,iso-2022-jp\r\n\xff\xff\xff";
    let (_, enc_jis_err) = detect_and_decode(bad_jis_header);
    assert_eq!(enc_jis_err, "ISO-2022-JP");

    let utf8_header = b"charset,utf-8\r\nHello UTF-8 header";
    let (_, enc_utf8_h) = detect_and_decode(utf8_header);
    assert_eq!(enc_utf8_h, "UTF-8");

    let (euc_bytes, _, _) = encoding_rs::EUC_JP.encode("漢字テスト");
    let (_, enc_heuristic) = detect_and_decode(&euc_bytes);
    assert!(!enc_heuristic.is_empty());

    let euc_only_bytes = &[0xA4, 0xA2, 0x80, 0xFF];
    let (_, enc_euc_only) = detect_and_decode(euc_only_bytes);
    assert!(!enc_euc_only.is_empty());

    let euc_valid_sjis_invalid = &[0xE0, 0xFD];
    let (_, enc_euc_exact) = detect_and_decode(euc_valid_sjis_invalid);
    assert_eq!(enc_euc_exact, "EUC-JP");

    assert!(encode_to_charset("🚀", "euc-jp").is_none());
}

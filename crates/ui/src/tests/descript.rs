/**
 * @file descript.rs
 * @brief descript.txt 属性パース単体テスト
 */

use super::*;

#[test]
fn test_descript_parse() {
    let sample = "charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\nicon,icon.ico\r\ncraftmanw,Author\r\n";
    let desc = Descript::parse(sample);
    assert_eq!(desc.name().map(|s| s.as_str()), Some("SampleGhost"));
    assert_eq!(desc.sakura_name().map(|s| s.as_str()), Some("Nanai"));
    assert_eq!(desc.kero_name().map(|s| s.as_str()), Some("Mini"));
    assert_eq!(desc.icon().map(|s| s.as_str()), Some("icon.ico"));
    assert_eq!(desc.craftmanw().map(|s| s.as_str()), Some("Author"));
}

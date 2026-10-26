//! descript.txt の読み込み・パース

use std::collections::HashMap;
use std::path::Path;

/// descript.txt の内容をパース（Shift_JIS / UTF-8 両対応）
pub fn read_descript_file(file_path: &Path) -> Option<HashMap<String, String>> {
    if !file_path.exists() {
        return None;
    }
    let bytes = std::fs::read(file_path).ok()?;
    let text = if let Ok(utf8_str) = std::str::from_utf8(&bytes) {
        if utf8_str.to_lowercase().contains("charset,shift_jis")
            || utf8_str.to_lowercase().contains("charset,sjis")
        {
            let (sjis_decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
            sjis_decoded.into_owned()
        } else {
            utf8_str.to_string()
        }
    } else {
        let (sjis_decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
        sjis_decoded.into_owned()
    };

    let mut map = HashMap::new();
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }
        if let Some((key, val)) = trimmed.split_once(',') {
            map.insert(key.trim().to_lowercase(), val.trim().to_string());
        } else if let Some((key, val)) = trimmed.split_once(':') {
            map.insert(key.trim().to_lowercase(), val.trim().to_string());
        }
    }
    Some(map)
}

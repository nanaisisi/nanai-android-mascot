use std::path::{Path, PathBuf};

pub fn decode_zip_entry_name(raw_bytes: &[u8]) -> String {
    if let Ok(s) = std::str::from_utf8(raw_bytes) {
        s.to_string()
    } else {
        let (cow, _, _) = encoding_rs::SHIFT_JIS.decode(raw_bytes);
        cow.into_owned()
    }
}

pub fn parse_zip_entry_descript(entry: &mut impl std::io::Read) -> std::collections::HashMap<String, String> {
    let mut map = std::collections::HashMap::new();
    let mut bytes = Vec::new();
    if entry.read_to_end(&mut bytes).is_err() {
        return map;
    }
    let text = if let Ok(utf8_str) = std::str::from_utf8(&bytes) {
        let lower = utf8_str.to_lowercase();
        if lower.contains("charset,shift_jis") || lower.contains("charset,sjis") {
            let (sjis_decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
            sjis_decoded.into_owned()
        } else {
            utf8_str.to_string()
        }
    } else {
        let (sjis_decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
        sjis_decoded.into_owned()
    };

    for line in text.lines() {
        let trimmed = line.trim().trim_start_matches('\u{feff}');
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }
        if let Some((key, val)) = trimmed.split_once(',').or_else(|| trimmed.split_once(':')) {
            let k = key.trim().to_lowercase();
            let v = val.trim().trim_end_matches(',').trim().to_string();
            if !k.is_empty() && !v.is_empty() {
                map.insert(k, v);
            }
        }
    }
    map
}

pub fn sanitize_dir_name(raw: &str) -> String {
    raw.chars()
        .map(|c| if r#"\/:*?"<>| "#.contains(c) { '_' } else { c })
        .collect()
}

pub fn zip_datetime_to_system_time(dt: zip::DateTime) -> Option<std::time::SystemTime> {
    let year = dt.year() as i64;
    let month = dt.month() as usize;
    let day = dt.day() as i64;
    if year < 1970 || !(1..=12).contains(&month) || !(1..=31).contains(&day) {
        return None;
    }

    let mut days = 0i64;
    for y in 1970..year {
        let leap = (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);
        days += if leap { 366 } else { 365 };
    }
    let leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    let days_in_months = [
        31,
        if leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    for &dim in &days_in_months[..(month - 1)] {
        days += dim;
    }
    days += day - 1;

    let secs = (days as u64) * 86_400
        + (dt.hour() as u64) * 3_600
        + (dt.minute() as u64) * 60
        + (dt.second() as u64);
    std::time::UNIX_EPOCH.checked_add(std::time::Duration::from_secs(secs))
}

pub fn flatten_balloon_directory(target_dir: &Path) -> Result<(), String> {
    let entries: Vec<PathBuf> = std::fs::read_dir(target_dir)
        .map_err(|e| format!("Failed to inspect balloon directory: {e}"))?
        .flatten()
        .map(|entry| entry.path())
        .collect();

    let wrapper = if target_dir.join("balloon").is_dir() {
        Some(target_dir.join("balloon"))
    } else if entries.len() == 1 && entries[0].is_dir() {
        Some(entries[0].clone())
    } else {
        None
    };

    let Some(wrapper) = wrapper else {
        return Ok(());
    };

    let children: Vec<PathBuf> = std::fs::read_dir(&wrapper)
        .map_err(|e| format!("Failed to inspect balloon wrapper: {e}"))?
        .flatten()
        .map(|entry| entry.path())
        .collect();
    for child in children {
        let destination = target_dir.join(
            child
                .file_name()
                .ok_or_else(|| "Invalid balloon archive entry".to_string())?,
        );
        if destination.exists() {
            if destination.is_dir() {
                std::fs::remove_dir_all(&destination)
                    .map_err(|e| format!("Failed to replace balloon entry: {e}"))?;
            } else {
                std::fs::remove_file(&destination)
                    .map_err(|e| format!("Failed to replace balloon entry: {e}"))?;
            }
        }
        std::fs::rename(&child, &destination)
            .map_err(|e| format!("Failed to normalize balloon entry: {e}"))?;
    }
    std::fs::remove_dir(&wrapper).map_err(|e| format!("Failed to remove balloon wrapper: {e}"))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_dir_name() {
        assert_eq!(sanitize_dir_name("Test Ghost/Name?"), "Test_Ghost_Name_");
        assert_eq!(sanitize_dir_name("normal_name"), "normal_name");
    }

    #[test]
    fn test_parse_zip_entry_descript() {
        let content = b"name,TestGhost\nversion,1.0.0\n// comment\n";
        let mut cursor = std::io::Cursor::new(content);
        let map = parse_zip_entry_descript(&mut cursor);
        assert_eq!(map.get("name"), Some(&"TestGhost".to_string()));
        assert_eq!(map.get("version"), Some(&"1.0.0".to_string()));
    }
}

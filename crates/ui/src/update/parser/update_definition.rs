//! updates2.dau / updates.txt アップデート定義パース処理モジュール

use crate::update::types::UpdateEntry;

/// updates2.dau (updates2dau) または updates.txt (updatestxt) の内容をパース
pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {
    let mut entries = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // updates.txt の場合: "file," プレフィックス
        let data_part = if let Some(stripped) = trimmed.strip_prefix("file,") {
            stripped
        } else if trimmed.starts_with("charset,") {
            continue;
        } else {
            trimmed
        };

        // 区切り文字: \x01 (Byte 1) または カンマフォールバック
        let parts: Vec<&str> = if data_part.contains('\x01') {
            data_part.split('\x01').collect()
        } else {
            data_part.split(',').collect()
        };

        let rel_path = parts[0].trim().replace('\\', "/");
        if rel_path.is_empty() {
            continue;
        }

        let md5_hash = if parts.len() > 1 {
            parts[1].trim().to_lowercase()
        } else {
            String::new()
        };

        // [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定、ignore, readonly, delete, size, date パラメータパース
        let mut is_delete = false;
        let mut is_ignore = false;
        let mut is_readonly = false;
        let mut option_flags = Vec::new();
        let mut size = None;
        let mut date = None;

        for &extra in parts.iter().skip(2) {
            let extra_trimmed = extra.trim();
            if extra_trimmed.is_empty() {
                continue;
            }
            if let Some(s) = extra_trimmed.strip_prefix("size=") {
                if let Ok(val) = s.parse::<u64>() {
                    size = Some(val);
                }
            } else if let Some(d) = extra_trimmed.strip_prefix("date=") {
                date = Some(d.to_string());
            } else if extra_trimmed.starts_with("charset=") {
                continue;
            } else if extra_trimmed.eq_ignore_ascii_case("delete") {
                is_delete = true;
                option_flags.push("delete".to_string());
            } else if extra_trimmed.eq_ignore_ascii_case("ignore") {
                is_ignore = true;
                option_flags.push("ignore".to_string());
            } else if extra_trimmed.eq_ignore_ascii_case("readonly") {
                is_readonly = true;
                option_flags.push("readonly".to_string());
            }
        }

        entries.push(UpdateEntry {
            path: rel_path,
            md5: md5_hash,
            size,
            is_delete,
            is_ignore,
            is_readonly,
            date,
            flags: option_flags,
        });
    }
    entries
}

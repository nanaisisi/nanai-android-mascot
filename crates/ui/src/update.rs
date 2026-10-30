#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdateEntry {
    pub path: String,
    pub md5: String,
    pub size: Option<u64>,
}

/// updates2.dau または updates.txt の内容をパース
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

        // [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定、ignore, readonly, delete, size パラメータパース
        let mut option_flags = Vec::new();
        let mut size = None;
        for &extra in parts.iter().skip(2) {
            let extra_trimmed = extra.trim();
            if let Some(s) = extra_trimmed.strip_prefix("size=")
                && let Ok(val) = s.parse::<u64>()
            {
                size = Some(val);
            } else if extra_trimmed.eq_ignore_ascii_case("ignore")
                || extra_trimmed.eq_ignore_ascii_case("readonly")
                || extra_trimmed.eq_ignore_ascii_case("delete")
            {
                option_flags.push(extra_trimmed.to_string());
            }
        }

        entries.push(UpdateEntry {
            path: rel_path,
            md5: md5_hash,
            size,
        });
    }
    entries
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_updates2_dau_byte1_delimited() {
        let content = "ghost\\master\\descript.txt\x011A2B3C4D5E6F7890ABCDEF1234567890\x01size=1024\r\n\
                       ghost\\master\\shiori.dll\x01FEDCBA09876543210987654321ABCDEF\r\n";
        let entries = parse_update_definition(content);
        assert_eq!(entries.len(), 2);

        assert_eq!(entries[0].path, "ghost/master/descript.txt");
        assert_eq!(entries[0].md5, "1a2b3c4d5e6f7890abcdef1234567890");
        assert_eq!(entries[0].size, Some(1024));

        assert_eq!(entries[1].path, "ghost/master/shiori.dll");
        assert_eq!(entries[1].md5, "fedcba09876543210987654321abcdef");
        assert_eq!(entries[1].size, None);
    }

    #[test]
    fn test_parse_updates_txt_comma_delimited() {
        let content = "charset,UTF-8\r\n\
                       file,ghost/master/descript.txt,1a2b3c4d5e6f7890abcdef1234567890,size=2048\r\n\
                       file,ghost\\master\\readme.txt,ABCDEF1234567890ABCDEF1234567890\r\n";
        let entries = parse_update_definition(content);
        assert_eq!(entries.len(), 2);

        assert_eq!(entries[0].path, "ghost/master/descript.txt");
        assert_eq!(entries[0].md5, "1a2b3c4d5e6f7890abcdef1234567890");
        assert_eq!(entries[0].size, Some(2048));

        assert_eq!(entries[1].path, "ghost/master/readme.txt");
        assert_eq!(entries[1].md5, "abcdef1234567890abcdef1234567890");
        assert_eq!(entries[1].size, None);
    }

    #[test]
    fn test_parse_update_definition_edge_cases() {
        // Empty and blank lines
        let content = "\r\n  \r\n\t\r\n";
        let entries = parse_update_definition(content);
        assert!(entries.is_empty());

        // Line with charset only
        let content = "charset,Shift_JIS\r\n";
        let entries = parse_update_definition(content);
        assert!(entries.is_empty());

        // File entry without MD5
        let content = "file,ghost/master/descript.txt\r\n";
        let entries = parse_update_definition(content);
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].path, "ghost/master/descript.txt");
        assert_eq!(entries[0].md5, "");
        assert_eq!(entries[0].size, None);

        // Entry with empty path after trimming
        let content = "file,,1a2b3c4d5e6f7890abcdef1234567890\r\n";
        let entries = parse_update_definition(content);
        assert!(entries.is_empty());

        // Extra unknown key-value pairs along with size and option flags (ignore, readonly, delete)
        let content = "shell/default/surface0.png\x0100112233445566778899aabbccddeeff\x01foo=bar\x01size=512\x01ignore\x01readonly\x01delete\x01baz=qux\r\n";
        let entries = parse_update_definition(content);
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].path, "shell/default/surface0.png");
        assert_eq!(entries[0].md5, "00112233445566778899aabbccddeeff");
        assert_eq!(entries[0].size, Some(512));
    }
}

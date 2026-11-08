//! developer_options.txt パース処理モジュール

/// developer_options.txt の内容をパースし、noupdate= で指定された除外ファイルパターン一覧を抽出
pub fn parse_developer_options(content: &str) -> Vec<String> {
    let mut noupdate_files = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim().trim_start_matches('\u{feff}');
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }
        if let Some(stripped) = trimmed.strip_prefix("noupdate=") {
            let file_pattern = stripped.trim().replace('\\', "/");
            if !file_pattern.is_empty() {
                noupdate_files.push(file_pattern);
            }
        } else if let Some((key, val)) = trimmed.split_once(',').or_else(|| trimmed.split_once(':'))
            && key.trim().eq_ignore_ascii_case("noupdate")
        {
            let file_pattern = val.trim().replace('\\', "/");
            if !file_pattern.is_empty() {
                noupdate_files.push(file_pattern);
            }
        }
    }
    noupdate_files
}

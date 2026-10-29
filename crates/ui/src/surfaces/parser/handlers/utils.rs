//! `handlers` 用の共通ユーティリティ関数

/// `0-9,20-22` のような範囲文字列をサーフィス番号列へ展開する
pub fn expand_range(spec: &str) -> Vec<u32> {
    let mut out = Vec::new();
    for part in spec.split(',') {
        let part = part.trim().trim_start_matches('[').trim_end_matches(']');
        if part.is_empty() {
            continue;
        }
        if let Some((start, end)) = part.split_once('-')
            && let (Ok(s), Ok(e)) = (start.trim().parse::<u32>(), end.trim().parse::<u32>())
            && s <= e
        {
            out.extend(s..=e);
            continue;
        }
        if let Ok(n) = part.parse::<u32>() {
            out.push(n);
        }
    }
    out
}

pub(crate) fn split_id_suffix(token: &str) -> (&str, Option<u32>) {
    let token = token.trim();
    match token.find(|c: char| c.is_ascii_digit()) {
        Some(pos) => {
            let (word, num) = token.split_at(pos);
            (word, num.parse().ok())
        }
        None => (token, None),
    }
}

pub(crate) fn first_i32(value: &str) -> Option<i32> {
    value
        .split(',')
        .map(str::trim)
        .find_map(|t| t.parse::<i32>().ok())
}

pub(crate) fn parse_balloon_offset_key(key: &str) -> Option<(String, char)> {
    if let Some(axis_str) = key.strip_prefix("balloon.offset") {
        let axis = axis_str.trim().trim_start_matches('.').chars().next()?;
        return Some(("*".to_string(), axis));
    }
    let (head, rest) = key.split_once(".balloon.offset")?;
    if head.is_empty() {
        return None;
    }
    let axis = rest.trim().trim_start_matches('.').chars().next()?;
    Some((head.to_string(), axis))
}

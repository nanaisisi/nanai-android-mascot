//! `handlers` 用の共通ユーティリティ関数

use std::collections::BTreeSet;

/// `0-9,20-22` や SSP 専用除外指定 `surface1-30,!15,!20-25` のような範囲文字列をサーフィス番号列へ展開する。
/// `!` で指定された除外IDは、記述の位置によらず他の指定よりも優先される。
pub fn expand_range(spec: &str) -> Vec<u32> {
    let mut included = Vec::new();
    let mut excluded = BTreeSet::new();

    for part in spec.split(',') {
        let mut part = part.trim().trim_start_matches('[').trim_end_matches(']');
        if part.is_empty() {
            continue;
        }

        let is_exclude = if let Some(stripped) = part.strip_prefix('!') {
            part = stripped.trim();
            true
        } else {
            false
        };

        if let Some((start, end)) = part.split_once('-')
            && let (Ok(s), Ok(e)) = (start.trim().parse::<u32>(), end.trim().parse::<u32>())
            && s <= e
        {
            if is_exclude {
                excluded.extend(s..=e);
            } else {
                included.extend(s..=e);
            }
            continue;
        }

        if let Ok(n) = part.parse::<u32>() {
            if is_exclude {
                excluded.insert(n);
            } else {
                included.push(n);
            }
        }
    }

    if excluded.is_empty() {
        included
    } else {
        included
            .into_iter()
            .filter(|id| !excluded.contains(id))
            .collect()
    }
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
    // balloon.offsetx, balloon.offsety, balloon.offset.x, balloon.offset.y
    if let Some(axis_str) = key.strip_prefix("balloon.offset") {
        let axis = axis_str.trim().trim_start_matches('.').chars().next()?;
        if axis == 'x' || axis == 'y' {
            return Some(("*".to_string(), axis));
        }
    }
    // sakura.balloon.offsetx / kero.balloon.offsetx / sakura.balloon.offset.x 等
    let (head, rest) = key.split_once(".balloon.offset")?;
    if head.is_empty() {
        return None;
    }
    let axis = rest.trim().trim_start_matches('.').chars().next()?;
    if axis == 'x' || axis == 'y' {
        Some((head.to_string(), axis))
    } else {
        None
    }
}

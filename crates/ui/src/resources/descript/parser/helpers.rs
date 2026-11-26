//! ID 範囲（例: `0-9` や `[1, 101, 201]`）展開ユーティリティモジュール

/// カンマ区切りの数値リスト（範囲対応 `0-9` 含む）をパースする
pub(crate) fn expand_ids(value: &str) -> Vec<u32> {
    let mut out = Vec::new();
    for part in value.split(',') {
        let part = part.trim().trim_start_matches('[').trim_end_matches(']');
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

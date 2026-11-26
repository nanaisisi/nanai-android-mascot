//! `surfaces.txt` ブロックヘッダー解析処理

/// surfaceN,surface.appendN 等のヘッダー行からサーフィスID一覧を展開
pub fn parse_surface_header(trimmed: &str) -> Option<Vec<String>> {
    let lower = trimmed.to_ascii_lowercase();
    if !lower.starts_with("surface") {
        return None;
    }

    let rest = if lower.starts_with("surface.append") {
        &trimmed["surface.append".len()..]
    } else if lower.starts_with("surface") {
        &trimmed["surface".len()..]
    } else {
        return None;
    };

    let rest = rest.trim();
    if rest.is_empty() {
        return None;
    }

    let mut result = Vec::new();
    for part in rest.split(',') {
        let p = part.trim();
        if p.contains('-')
            && let Some((start_s, end_s)) = p.split_once('-')
            && let (Ok(start), Ok(end)) =
                (start_s.trim().parse::<u32>(), end_s.trim().parse::<u32>())
        {
            for i in start..=end {
                result.push(i.to_string());
            }
            continue;
        }
        if let Ok(num) = p.parse::<u32>() {
            result.push(num.to_string());
        }
    }

    if result.is_empty() {
        None
    } else {
        Some(result)
    }
}

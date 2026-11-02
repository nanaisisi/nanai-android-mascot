//! `surfaces.txt` パーサー補助関数・ブロック行ハンドラー

use crate::surfaces::types::*;
use super::handlers::*;

/// ブロック種別
#[derive(Clone, Debug)]
pub(crate) enum BlockKind {
    /// `descript {}` ブロック
    Descript,
    /// `surface.alias {}` / `sakura.surface.alias {}` / `kero.surface.alias {}` ブロック
    Alias { kero: bool },
    /// `surface[N...]` / `surface.append[N...]` / `sakura.surface[N...]` ブロック
    Surface { ids: Vec<u32>, append: bool },
    /// `*.cursor {}` ブロック
    Cursor { scope: String },
    /// `*.tooltips {}` ブロック
    Tooltip { scope: String },
}

/// ブロックに入る際の初期化（surface の定義クリア / マージ準備）
pub(crate) fn prepare_block(txt: &mut SurfacesTxt, kind: &BlockKind) {
    if let BlockKind::Surface { ids, append } = kind
        && !*append
    {
        // surface ブロックは既存定義を上書き（append は追記）
        for id in ids {
            txt.surfaces.insert(*id, SurfaceDefinition::default());
        }
    }
}

/// ブロック開始行（`surface[N]` / `surface.append[N]` / `*.surface.alias` / `descript` / `*.cursor` / `*.tooltips`）を判定する
pub(crate) fn parse_block_opener(line: &str) -> Option<BlockKind> {
    let raw = line.trim();

    // *.cursor ブロック
    // 例: sakura.cursor, kero.cursor, char0.cursor, cursor
    for prefix in [
        "sakura.cursor",
        "kero.cursor",
        "char0.cursor",
        "char1.cursor",
        "cursor",
    ] {
        if let Some(rest) = raw.strip_prefix(prefix) {
            let after = rest.trim();
            if after.is_empty() || after == "{" {
                let scope = match prefix {
                    "sakura.cursor" | "char0.cursor" => "sakura",
                    "kero.cursor" | "char1.cursor" => "kero",
                    "cursor" => "*",
                    _ => prefix,
                };
                return Some(BlockKind::Cursor {
                    scope: scope.to_string(),
                });
            }
        }
    }
    if raw.starts_with("char")
        && raw.contains(".cursor")
        && let Some((scope, rest)) = raw.split_once(".cursor")
    {
        let after = rest.trim();
        if after.is_empty() || after == "{" {
            return Some(BlockKind::Cursor {
                scope: scope.to_string(),
            });
        }
    }

    // *.tooltips ブロック
    // 例: sakura.tooltips, kero.tooltips, char0.tooltips, tooltips
    for prefix in [
        "sakura.tooltips",
        "kero.tooltips",
        "char0.tooltips",
        "char1.tooltips",
        "tooltips",
    ] {
        if let Some(rest) = raw.strip_prefix(prefix) {
            let after = rest.trim();
            if after.is_empty() || after == "{" {
                let scope = match prefix {
                    "sakura.tooltips" | "char0.tooltips" => "sakura",
                    "kero.tooltips" | "char1.tooltips" => "kero",
                    "tooltips" => "*",
                    _ => prefix,
                };
                return Some(BlockKind::Tooltip {
                    scope: scope.to_string(),
                });
            }
        }
    }
    if raw.starts_with("char")
        && raw.contains(".tooltips")
        && let Some((scope, rest)) = raw.split_once(".tooltips")
    {
        let after = rest.trim();
        if after.is_empty() || after == "{" {
            return Some(BlockKind::Tooltip {
                scope: scope.to_string(),
            });
        }
    }

    let (stripped_line, kero) = match raw {
        l if l.starts_with("sakura.surface") => (&l["sakura.".len()..], false),
        l if l.starts_with("kero.surface") => (&l["kero.".len()..], true),
        l if l.starts_with("char0.surface") => (&l["char0.".len()..], false),
        l if l.starts_with("char1.surface") => (&l["char1.".len()..], true),
        _ => (raw, false),
    };
    if let Some(rest) = stripped_line.strip_prefix("surface") {
        let rest = rest.replace(['[', ']'], " ");
        if let Some(spec) = rest.strip_prefix(".append") {
            if spec
                .trim()
                .starts_with(|c: char| c.is_ascii_digit() || c == ',')
            {
                return Some(BlockKind::Surface {
                    ids: expand_range(spec.trim().trim_end_matches('{')),
                    append: true,
                });
            }
            return None;
        }
        if let Some(spec) = rest.strip_prefix(".alias") {
            if spec.trim().is_empty() || spec.trim() == "{" {
                return Some(BlockKind::Alias { kero });
            }
            return None;
        }
        if rest.strip_prefix('.').is_some() {
            return None;
        }
        let spec = rest.trim();
        if spec.starts_with(|c: char| c.is_ascii_digit() || c == ',') {
            return Some(BlockKind::Surface {
                ids: expand_range(spec.trim_end_matches('{')),
                append: false,
            });
        }
        return None;
    }
    if raw.strip_prefix("descript").is_some() {
        let after = raw["descript".len()..].trim();
        if after.is_empty() || after == "{" {
            return Some(BlockKind::Descript);
        }
    }
    None
}

/// ルート（ブロック外）の行を処理する
pub(crate) fn handle_root_line(txt: &mut SurfacesTxt, line: &str) {
    let Some((key, value)) = split_key_value(line) else {
        return;
    };
    if key.is_empty() {
        return;
    }
    if key.to_lowercase() == "charset" {
        txt.charset = Some(value.trim().to_string());
    } else {
        txt.properties
            .insert(key.to_string(), value.trim().to_string());
    }
}

/// `descript {}` ブロック内の行を処理する
pub(crate) fn handle_descript_line(txt: &mut SurfacesTxt, line: &str) {
    let Some((key, value)) = split_key_value(line) else {
        return;
    };
    match key.to_lowercase().as_str() {
        "version" => txt.version = value.trim().parse().unwrap_or(0),
        "maxwidth" => txt.maxwidth = value.trim().parse().ok(),
        "animation-sort" | "animation.sort" => txt.animation_sort = Some(SortKind::parse(value)),
        "collision-sort" | "collision.sort" => txt.collision_sort = Some(SortKind::parse(value)),
        k => {
            txt.properties
                .insert(k.to_string(), value.trim().to_string());
        }
    }
}

/// `surface.alias {}` ブロック内の行を処理する
pub(crate) fn handle_alias_line(txt: &mut SurfacesTxt, kero: bool, line: &str) {
    let Some((name, rest)) = split_key_value(line) else {
        return;
    };
    let name = name.trim().to_string();
    if name.is_empty() {
        return;
    }
    if kero {
        txt.kero_aliases.insert(name, expand_range(rest));
    } else {
        txt.aliases.insert(name, expand_range(rest));
    }
}

/// `*.cursor {}` ブロック内の行を処理する (例: `mouseup0,Head,system:hand` または `mouseup,Head,system:hand`)
pub(crate) fn handle_cursor_line(txt: &mut SurfacesTxt, scope: &str, line: &str) {
    let tokens: Vec<&str> = line.split(',').map(str::trim).collect();
    if tokens.len() < 3 {
        return;
    }
    let raw_event = tokens[0].to_lowercase();
    let collision = tokens[1].to_string();
    let cursor = tokens[2].to_string();

    let event = if raw_event.starts_with("mouseup") {
        "mouseup"
    } else if raw_event.starts_with("mousedown") {
        "mousedown"
    } else if raw_event.starts_with("mouserightdown") {
        "mouserightdown"
    } else if raw_event.starts_with("mousewheel") {
        "mousewheel"
    } else if raw_event.starts_with("mousehover") {
        "mousehover"
    } else {
        &raw_event
    };

    txt.cursors
        .entry(scope.to_string())
        .or_default()
        .push(CursorDefinition {
            event: event.to_string(),
            collision,
            cursor,
        });
}

/// `*.tooltips {}` ブロック内の行を処理する (例: `Bust,怒ります。`)
pub(crate) fn handle_tooltip_line(txt: &mut SurfacesTxt, scope: &str, line: &str) {
    let Some((collision, text)) = split_key_value(line) else {
        return;
    };
    let collision = collision.trim().to_string();
    let text = text.trim().to_string();
    if !collision.is_empty() {
        txt.tooltips
            .entry(scope.to_string())
            .or_default()
            .insert(collision, text);
    }
}

/// `surface[N] {}` / `surface.append[N] {}` ブロック内の行を処理する
pub(crate) fn handle_surface_line(txt: &mut SurfacesTxt, ids: &[u32], line: &str) {
    let Some((key, value)) = split_key_value(line) else {
        return;
    };
    if key.is_empty() {
        return;
    }
    let key_lower = key.to_lowercase();

    if let Some(rest) = key_lower.strip_prefix("collisionex") {
        apply_collisionex(txt, ids, rest, value);
    } else if let Some(rest) = key_lower.strip_prefix("collision") {
        apply_collision(txt, ids, rest, value);
    } else if let Some(rest) = key_lower.strip_prefix("element") {
        apply_element(txt, ids, rest, value);
    } else if let Some(rest) = key_lower.strip_prefix("animation") {
        apply_animation_line(txt, ids, rest, value);
    } else if key_lower == "name" {
        for id in ids {
            txt.surfaces.entry(*id).or_default().name = Some(value.trim().to_string());
        }
    } else if key_lower == "icon.rect" {
        let coords: Vec<i32> = value
            .split(',')
            .filter_map(|t| t.trim().parse::<i32>().ok())
            .collect();
        if coords.len() >= 4 {
            let rect = [coords[0], coords[1], coords[2], coords[3]];
            for id in ids {
                txt.surfaces.entry(*id).or_default().icon_rect = Some(rect);
            }
        }
    } else if let Some(rest) = key_lower.strip_prefix("point.") {
        apply_point(txt, ids, rest, value);
    } else if let Some(offset) = parse_balloon_offset_key(&key_lower) {
        for id in ids {
            let def = txt.surfaces.entry(*id).or_default();
            let entry = def.balloon_offsets.entry(offset.0.clone()).or_default();
            if offset.1 == 'x' {
                entry.x = first_i32(value);
            } else {
                entry.y = first_i32(value);
            }
        }
    } else {
        for id in ids {
            txt.surfaces
                .entry(*id)
                .or_default()
                .properties
                .insert(key.to_string(), value.trim().to_string());
        }
    }
}

pub(crate) fn split_key_value(line: &str) -> Option<(&str, &str)> {
    let line = line.trim().trim_end_matches('{').trim();
    let (key, value) = line.split_once(',')?;
    Some((key.trim(), value.trim()))
}

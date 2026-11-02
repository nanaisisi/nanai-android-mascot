//! `surfaces.txt` ブロック行ハンドラー

use crate::surfaces::parser::handlers::*;
use crate::surfaces::types::*;

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

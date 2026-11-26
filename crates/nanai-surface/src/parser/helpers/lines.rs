//! `surfaces.txt` ブロック行ハンドラー

use super::blocks::BlockKind;
use crate::parser::handlers::{apply_surface_key, expand_range};
use crate::types::*;

/// スコープに応じた行処理を実行する
pub(in crate::parser) fn dispatch_scope_line(
    txt: &mut SurfacesTxt,
    scope: &Option<BlockKind>,
    line: &str,
) {
    match scope {
        Some(BlockKind::Descript) => handle_descript_line(txt, line),
        Some(BlockKind::Alias { kero }) => handle_alias_line(txt, *kero, line),
        Some(BlockKind::CharAlias { char_id }) => handle_char_alias_line(txt, *char_id, line),
        Some(BlockKind::Surface { ids, .. }) => handle_surface_line(txt, ids, line),
        Some(BlockKind::Cursor { scope }) => handle_cursor_line(txt, scope, line),
        Some(BlockKind::Tooltip { scope }) => handle_tooltip_line(txt, scope, line),
        None => handle_root_line(txt, line),
    }
}

/// ルート（ブロック外）の行を処理する
fn handle_root_line(txt: &mut SurfacesTxt, line: &str) {
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

/// `char<N>.surface.alias {}` ブロック内の行を処理する
pub(crate) fn handle_char_alias_line(txt: &mut SurfacesTxt, char_id: u32, line: &str) {
    let Some((name, rest)) = split_key_value(line) else {
        return;
    };
    let name = name.trim().to_string();
    if name.is_empty() {
        return;
    }
    if char_id == 0 {
        txt.aliases.insert(name, expand_range(rest));
    } else if char_id == 1 {
        txt.kero_aliases.insert(name, expand_range(rest));
    } else {
        txt.char_aliases
            .entry(char_id)
            .or_default()
            .insert(name, expand_range(rest));
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
        .push(CursorDefinition::new(event.to_string(), collision, cursor));
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
    apply_surface_key(txt, ids, key, value);
}

pub(crate) fn split_key_value(line: &str) -> Option<(&str, &str)> {
    let line = line.trim().trim_end_matches('{').trim();
    let (key, value) = line.split_once(',')?;
    Some((key.trim(), value.trim()))
}

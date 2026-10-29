//! `surfaces.txt` 構文解析パーサー（ブロック判定・行ルート振り分け）

use crate::surfaces::types::*;

pub mod handlers;

pub use handlers::expand_range;
use handlers::*;

/// ブロック種別
#[derive(Clone, Debug)]
pub(super) enum BlockKind {
    /// `descript {}` ブロック
    Descript,
    /// `surface.alias {}` / `sakura.surface.alias {}` / `kero.surface.alias {}` ブロック
    Alias { kero: bool },
    /// `surface[N...]` / `surface.append[N...]` / `sakura.surface[N...]` ブロック
    Surface { ids: Vec<u32>, append: bool },
}

/// テキスト内容から `surfaces.txt` をパースする
pub fn parse_surfaces_txt(text: &str) -> SurfacesTxt {
    let mut txt = SurfacesTxt::default();
    let mut scope: Option<BlockKind> = None;

    for raw in text.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with("//") {
            continue;
        }

        // ブロックの開始 brace（単独行）
        if line == "{" {
            continue;
        }
        if line == "}" {
            scope = None;
            continue;
        }

        // ブロック開始行の検出（scope にいない場合のみ）
        if scope.is_none()
            && let Some(kind) = parse_block_opener(line)
        {
            prepare_block(&mut txt, &kind);
            scope = Some(kind);
            continue;
        }

        match &scope {
            Some(BlockKind::Descript) => handle_descript_line(&mut txt, line),
            Some(BlockKind::Alias { kero }) => handle_alias_line(&mut txt, *kero, line),
            Some(BlockKind::Surface { ids, .. }) => {
                let ids = ids.clone();
                handle_surface_line(&mut txt, &ids, line);
            }
            None => handle_root_line(&mut txt, line),
        }
    }

    txt
}

/// ブロックに入る際の初期化（surface の定義クリア / マージ準備）
fn prepare_block(txt: &mut SurfacesTxt, kind: &BlockKind) {
    if let BlockKind::Surface { ids, append } = kind
        && !*append
    {
        // surface ブロックは既存定義を上書き（append は追記）
        for id in ids {
            txt.surfaces.insert(*id, SurfaceDefinition::default());
        }
    }
}

/// ブロック開始行（`surface[N]` / `surface.append[N]` / `*.surface.alias` / `descript`）を判定する
fn parse_block_opener(line: &str) -> Option<BlockKind> {
    let (line, kero) = match line {
        l if l.starts_with("sakura.surface") => (&l["sakura.".len()..], false),
        l if l.starts_with("kero.surface") => (&l["kero.".len()..], true),
        l if l.starts_with("char0.surface") => (&l["char0.".len()..], false),
        l if l.starts_with("char1.surface") => (&l["char1.".len()..], true),
        _ => (line, false),
    };
    if let Some(rest) = line.strip_prefix("surface") {
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
    if line.strip_prefix("descript").is_some() {
        let after = line["descript".len()..].trim();
        if after.is_empty() || after == "{" {
            return Some(BlockKind::Descript);
        }
    }
    None
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
fn handle_descript_line(txt: &mut SurfacesTxt, line: &str) {
    let Some((key, value)) = split_key_value(line) else {
        return;
    };
    match key.to_lowercase().as_str() {
        "version" => txt.version = value.trim().parse().unwrap_or(0),
        "maxwidth" => txt.maxwidth = value.trim().parse().ok(),
        "animation.sort" => txt.animation_sort = Some(SortKind::parse(value)),
        "collision.sort" => txt.collision_sort = Some(SortKind::parse(value)),
        k => {
            txt.properties
                .insert(k.to_string(), value.trim().to_string());
        }
    }
}

/// `surface.alias {}` ブロック内の行を処理する
fn handle_alias_line(txt: &mut SurfacesTxt, kero: bool, line: &str) {
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

/// `surface[N] {}` / `surface.append[N] {}` ブロック内の行を処理する
fn handle_surface_line(txt: &mut SurfacesTxt, ids: &[u32], line: &str) {
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

fn split_key_value(line: &str) -> Option<(&str, &str)> {
    let line = line.trim().trim_end_matches('{').trim();
    let (key, value) = line.split_once(',')?;
    Some((key.trim(), value.trim()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_surfaces_txt_blocks() {
        let text = "descript {\r\nversion,1\r\n}\r\nsurface.alias {\r\nmain,0,1\r\n}\r\nsurface0 {\r\nelement0,overlay,base.png,0,0\r\npoint.centerx,100\r\nballoon.offsetx,10\r\notherkey,value\r\n}\r\nsurface.append0 {\r\nelement1,overlay,top.png,0,0\r\n}\r\n";
        let parsed = parse_surfaces_txt(text);
        assert_eq!(parsed.version, 1);
        assert!(parsed.aliases.contains_key("main"));
        assert!(parsed.surfaces.contains_key(&0));
        let def = parsed.surfaces.get(&0).unwrap();
        assert_eq!(def.elements.len(), 2);
        assert_eq!(def.points.center_x, Some(100));
        assert_eq!(def.balloon_offsets.get("*").unwrap().x, Some(10));
        assert_eq!(def.properties.get("otherkey").unwrap(), "value");
    }
}

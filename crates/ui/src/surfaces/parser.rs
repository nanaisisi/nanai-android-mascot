//! `surfaces.txt` 構文解析パーサー

use super::types::*;

/// ブロック種別
#[derive(Clone, Debug)]
enum BlockKind {
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
            Some(BlockKind::Alias { kero }) => {
                handle_alias_line(&mut txt, *kero, line)
            }
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
        let rest = rest.replace('[', " ").replace(']', " ");
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

fn split_id_suffix(token: &str) -> (&str, Option<u32>) {
    let token = token.trim();
    match token.find(|c: char| c.is_ascii_digit()) {
        Some(pos) => {
            let (word, num) = token.split_at(pos);
            (word, num.parse().ok())
        }
        None => (token, None),
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

    if key_lower.starts_with("collisionex") {
        apply_collisionex(txt, ids, &key_lower["collisionex".len()..], value);
    } else if key_lower.starts_with("collision") {
        apply_collision(txt, ids, &key_lower["collision".len()..], value);
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

fn first_i32(value: &str) -> Option<i32> {
    value
        .split(',')
        .map(str::trim)
        .find_map(|t| t.parse::<i32>().ok())
}

fn parse_balloon_offset_key(key: &str) -> Option<(String, char)> {
    if let Some(axis_str) = key.strip_prefix("balloon.offset") {
        let axis = axis_str.trim().chars().next()?;
        return Some(("*".to_string(), axis));
    }
    let (head, rest) = key.split_once(".balloon.offset")?;
    if head.is_empty() {
        return None;
    }
    let axis = rest.trim().chars().next()?;
    Some((head.to_string(), axis))
}

fn apply_collisionex(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, id) = split_id_suffix(id_part);
    let tokens: Vec<&str> = value.split(',').map(str::trim).collect();
    if tokens.len() < 3 {
        return;
    }
    let name = tokens[0].to_string();
    let shape_kind = tokens[1].to_lowercase();
    let coords: Vec<i32> = tokens[2..].iter().filter_map(|t| t.parse().ok()).collect();

    let shape = match shape_kind.as_str() {
        "rect" if coords.len() >= 4 => Some(CollisionShape::Rect {
            x1: coords[0],
            y1: coords[1],
            x2: coords[2],
            y2: coords[3],
        }),
        "polygon" if coords.len() >= 6 => Some(CollisionShape::Polygon {
            vertices: coords
                .chunks(2)
                .filter(|c| c.len() == 2)
                .map(|c| (c[0], c[1]))
                .collect(),
        }),
        _ => {
            if coords.len() >= 6 {
                Some(CollisionShape::Polygon {
                    vertices: coords
                        .chunks(2)
                        .filter(|c| c.len() == 2)
                        .map(|c| (c[0], c[1]))
                        .collect(),
                })
            } else if coords.len() == 4 {
                Some(CollisionShape::Rect {
                    x1: coords[0],
                    y1: coords[1],
                    x2: coords[2],
                    y2: coords[3],
                })
            } else {
                None
            }
        }
    };

    let Some(shape) = shape else { return };
    for num in ids {
        txt.surfaces
            .entry(*num)
            .or_default()
            .collisions
            .push(CollisionArea {
                id,
                name: name.clone(),
                shape: shape.clone(),
            });
    }
}

fn apply_collision(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, mut id) = split_id_suffix(id_part);
    let tokens: Vec<&str> = value.split(',').map(str::trim).collect();

    if id.is_none() && tokens.len() >= 6 {
        id = tokens[0].parse().ok();
        apply_collision_body(txt, ids, id, &tokens[1..]);
    } else {
        apply_collision_body(txt, ids, id, &tokens);
    }
}

fn apply_collision_body(txt: &mut SurfacesTxt, ids: &[u32], id: Option<u32>, tokens: &[&str]) {
    if tokens.len() < 5 {
        return;
    }
    let Ok(x1) = tokens[0].parse::<i32>() else {
        return;
    };
    let Ok(y1) = tokens[1].parse::<i32>() else {
        return;
    };
    let Ok(x2) = tokens[2].parse::<i32>() else {
        return;
    };
    let Ok(y2) = tokens[3].parse::<i32>() else {
        return;
    };
    let name = tokens[4].trim().to_string();
    for num in ids {
        txt.surfaces
            .entry(*num)
            .or_default()
            .collisions
            .push(CollisionArea {
                id,
                name: name.clone(),
                shape: CollisionShape::Rect { x1, y1, x2, y2 },
            });
    }
}

fn apply_element(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, id) = split_id_suffix(id_part);
    let tokens: Vec<String> = value.split(',').map(|t| t.trim().to_string()).collect();
    if tokens.len() < 3 {
        return;
    }
    let element = ElementDef {
        id: id.unwrap_or(0),
        method: DrawMethod::parse(&tokens[0]),
        file: tokens[1].clone(),
        x: tokens.get(2).and_then(|t| t.parse().ok()).unwrap_or(0),
        y: tokens.get(3).and_then(|t| t.parse().ok()).unwrap_or(0),
        options: tokens.iter().skip(4).cloned().collect(),
    };
    for num in ids {
        txt.surfaces
            .entry(*num)
            .or_default()
            .elements
            .push(element.clone());
    }
}

fn apply_animation_line(txt: &mut SurfacesTxt, ids: &[u32], rest: &str, value: &str) {
    let Some((id_part, field)) = rest.split_once('.') else {
        return;
    };
    let Ok(id) = id_part.trim().parse::<u32>() else {
        return;
    };
    let field = field.trim();
    let field_lower = field.to_lowercase();

    for num in ids {
        let def = txt.surfaces.entry(*num).or_default();
        let anim = def.animations.entry(id).or_default();
        anim.id = id;

        if field_lower == "interval" {
            anim.interval = Some(Interval::parse(value));
        } else if field_lower.starts_with("name") {
            anim.name = Some(value.trim().to_string());
        } else if field_lower.starts_with("option") {
            anim.options
                .push(value.split(',').map(|t| t.trim().to_string()).collect());
        } else if field_lower.starts_with("pattern") {
            let index = if field_lower == "pattern" {
                anim.patterns.len() as u32
            } else {
                split_id_suffix(&field["pattern".len()..]).1.unwrap_or(0)
            };
            let tokens: Vec<&str> = value.split(',').map(str::trim).collect();
            if tokens.is_empty() {
                continue;
            }
            let pattern = AnimationPattern {
                index,
                method: DrawMethod::parse(tokens[0]),
                surface: tokens.get(1).and_then(|t| t.parse().ok()).unwrap_or(0),
                wait: tokens.get(2).and_then(|t| t.parse().ok()).unwrap_or(0),
                x: tokens.get(3).and_then(|t| t.parse().ok()).unwrap_or(0),
                y: tokens.get(4).and_then(|t| t.parse().ok()).unwrap_or(0),
                options: tokens.iter().skip(5).map(|t| t.to_string()).collect(),
            };
            anim.patterns.push(pattern);
        }
    }
}

fn apply_point(txt: &mut SurfacesTxt, ids: &[u32], field: &str, value: &str) {
    let parsed = first_i32(value);
    for num in ids {
        let points = &mut txt.surfaces.entry(*num).or_default().points;
        match field {
            "centerx" => points.center_x = parsed,
            "centery" => points.center_y = parsed,
            "basepos.x" => points.basepos_x = parsed,
            "basepos.y" => points.basepos_y = parsed,
            "kinoko.centerx" => points.kinoko_center_x = parsed,
            "kinoko.centery" => points.kinoko_center_y = parsed,
            _ => {}
        }
    }
}

/// `0-9,20-22` のような範囲文字列をサーフィス番号列へ展開する
pub fn expand_range(spec: &str) -> Vec<u32> {
    let mut out = Vec::new();
    for part in spec.split(',') {
        let part = part.trim().trim_start_matches('[').trim_end_matches(']');
        if part.is_empty() {
            continue;
        }
        if let Some((start, end)) = part.split_once('-') {
            if let (Ok(s), Ok(e)) = (start.trim().parse::<u32>(), end.trim().parse::<u32>()) {
                if s <= e {
                    out.extend(s..=e);
                    continue;
                }
            }
        }
        if let Ok(n) = part.parse::<u32>() {
            out.push(n);
        }
    }
    out
}

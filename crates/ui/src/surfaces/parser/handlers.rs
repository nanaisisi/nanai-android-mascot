//! `surface[N]` ブロック内の個別キー処理（collision / element / animation / point）

use crate::surfaces::types::*;

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

pub(super) fn split_id_suffix(token: &str) -> (&str, Option<u32>) {
    let token = token.trim();
    match token.find(|c: char| c.is_ascii_digit()) {
        Some(pos) => {
            let (word, num) = token.split_at(pos);
            (word, num.parse().ok())
        }
        None => (token, None),
    }
}

pub(super) fn first_i32(value: &str) -> Option<i32> {
    value
        .split(',')
        .map(str::trim)
        .find_map(|t| t.parse::<i32>().ok())
}

pub(super) fn parse_balloon_offset_key(key: &str) -> Option<(String, char)> {
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

pub(super) fn apply_collisionex(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
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
        // circle: 中心X, 中心Y, 半径X, 半径Y（半径Y省略時は真円）
        "circle" if coords.len() >= 3 => Some(match coords.len() {
            4.. => CollisionShape::Ellipse {
                cx: coords[0],
                cy: coords[1],
                rx: coords[2] as f64,
                ry: coords[3] as f64,
            },
            _ => CollisionShape::Circle {
                cx: coords[0],
                cy: coords[1],
                r: coords[2] as f64,
            },
        }),
        // ellipse: 中心X, 中心Y, 半径X, 半径Y
        "ellipse" if coords.len() >= 4 => Some(CollisionShape::Ellipse {
            cx: coords[0],
            cy: coords[1],
            rx: coords[2] as f64,
            ry: coords[3] as f64,
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

pub(super) fn apply_collision(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, mut id) = split_id_suffix(id_part);
    let tokens: Vec<&str> = value.split(',').map(str::trim).collect();

    if id.is_none() && tokens.len() >= 6 {
        id = tokens[0].parse().ok();
        apply_collision_body(txt, ids, id, &tokens[1..]);
    } else {
        apply_collision_body(txt, ids, id, &tokens);
    }
}

pub(super) fn apply_collision_body(
    txt: &mut SurfacesTxt,
    ids: &[u32],
    id: Option<u32>,
    tokens: &[&str],
) {
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

pub(super) fn apply_element(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
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

pub(super) fn apply_animation_line(txt: &mut SurfacesTxt, ids: &[u32], rest: &str, value: &str) {
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
            // ウェイトは単一値（`85`）または SSP 拡張の範囲指定（`85-120`）を許容する
            let (wait, wait_max) = tokens
                .get(2)
                .and_then(|t| {
                    let (low, high) = match t.split_once('-') {
                        Some((low, high)) => (low, high),
                        None => (*t, ""),
                    };
                    let low = low.parse::<u32>().ok()?;
                    let high = high.parse::<u32>().ok();
                    match high {
                        Some(h) if h >= low => Some((low, Some(h))),
                        Some(_) => Some((low, Some(low))),
                        None => Some((low, None)),
                    }
                })
                .unwrap_or((0, None));
            let pattern = AnimationPattern {
                index,
                method: DrawMethod::parse(tokens[0]),
                surface: tokens.get(1).and_then(|t| t.parse().ok()).unwrap_or(0),
                wait,
                wait_max,
                x: tokens.get(3).and_then(|t| t.parse().ok()).unwrap_or(0),
                y: tokens.get(4).and_then(|t| t.parse().ok()).unwrap_or(0),
                options: tokens.iter().skip(5).map(|t| t.to_string()).collect(),
            };
            anim.patterns.push(pattern);
        }
    }
}

pub(super) fn apply_point(txt: &mut SurfacesTxt, ids: &[u32], field: &str, value: &str) {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_expand_range() {
        assert_eq!(expand_range("0-2,5"), vec![0, 1, 2, 5]);
        assert_eq!(expand_range("[10-12]"), vec![10, 11, 12]);
        assert_eq!(expand_range("invalid"), Vec::<u32>::new());
    }

    #[test]
    fn test_split_id_suffix() {
        assert_eq!(split_id_suffix("test100"), ("test", Some(100)));
        assert_eq!(split_id_suffix("noint"), ("noint", None));
    }

    #[test]
    fn test_first_i32() {
        assert_eq!(first_i32(" 42 , 100 "), Some(42));
        assert_eq!(first_i32("abc"), None);
    }

    #[test]
    fn test_parse_balloon_offset_key() {
        assert_eq!(parse_balloon_offset_key("balloon.offset.x"), Some(("*".to_string(), 'x')));
        assert_eq!(parse_balloon_offset_key("sakura.balloon.offset.y"), Some(("sakura".to_string(), 'y')));
        assert_eq!(parse_balloon_offset_key("invalid"), None);
    }

    #[test]
    fn test_apply_handlers() {
        let mut txt = SurfacesTxt::default();
        apply_point(&mut txt, &[0], "centerx", "150");
        assert_eq!(txt.surfaces.get(&0).unwrap().points.center_x, Some(150));

        apply_element(&mut txt, &[0], "element0", "overlay,base.png,0,0");
        assert_eq!(txt.surfaces.get(&0).unwrap().elements.len(), 1);

        apply_collision(&mut txt, &[0], "collision0", "0,0,50,50,Face");
        assert_eq!(txt.surfaces.get(&0).unwrap().collisions.len(), 1);

        apply_animation_line(&mut txt, &[0], "0.interval", "sometimes");
        apply_animation_line(&mut txt, &[0], "0.pattern0", "overlay,6,85-120,0,0");
        assert!(txt.surfaces.get(&0).unwrap().animations.contains_key(&0));
    }
}

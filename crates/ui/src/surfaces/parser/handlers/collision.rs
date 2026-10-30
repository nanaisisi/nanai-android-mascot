//! 当たり判定 (`collision` / `collisionex`) ハンドラー

use super::utils::split_id_suffix;
use crate::surfaces::types::*;

pub(crate) fn apply_collisionex(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
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

pub(crate) fn apply_collision(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, mut id) = split_id_suffix(id_part);
    let tokens: Vec<&str> = value.split(',').map(str::trim).collect();

    if id.is_none() && tokens.len() >= 6 {
        id = tokens[0].parse().ok();
        apply_collision_body(txt, ids, id, &tokens[1..]);
    } else {
        apply_collision_body(txt, ids, id, &tokens);
    }
}

pub(crate) fn apply_collision_body(
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

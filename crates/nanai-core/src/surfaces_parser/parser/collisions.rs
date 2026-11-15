//! 衝突判定領域 (collisionN, collisionexN) 行パース処理

use crate::surface_collision::{CollisionArea, CollisionShape};
use std::collections::BTreeMap;

pub fn parse_collision_line(
    trimmed: &str,
    current_surfaces: &[String],
    collisions: &mut BTreeMap<String, Vec<CollisionArea>>,
) {
    let lower = trimmed.to_ascii_lowercase();
    if lower.starts_with("collisionex") {
        let parts: Vec<&str> = trimmed.split(',').map(|s| s.trim()).collect();
        if parts.len() >= 3 {
            let id = parts[0]
                .trim_start_matches(|c: char| !c.is_ascii_digit())
                .parse::<i32>()
                .unwrap_or(0);
            let name = parts[1].to_ascii_lowercase();
            let shape_type = parts[2].to_ascii_lowercase();

            let shape = match shape_type.as_str() {
                "rect" | "box" => {
                    if parts.len() >= 7 {
                        let x1 = parts[3].parse::<i32>().unwrap_or(0);
                        let y1 = parts[4].parse::<i32>().unwrap_or(0);
                        let x2 = parts[5].parse::<i32>().unwrap_or(0);
                        let y2 = parts[6].parse::<i32>().unwrap_or(0);
                        Some(CollisionShape::Rect { x1, y1, x2, y2 })
                    } else {
                        None
                    }
                }
                "circle" => {
                    if parts.len() >= 6 {
                        let cx = parts[3].parse::<i32>().unwrap_or(0);
                        let cy = parts[4].parse::<i32>().unwrap_or(0);
                        let r = parts[5].parse::<i32>().unwrap_or(0);
                        Some(CollisionShape::Circle { cx, cy, r })
                    } else {
                        None
                    }
                }
                "ellipse" => {
                    if parts.len() >= 7 {
                        let cx = parts[3].parse::<i32>().unwrap_or(0);
                        let cy = parts[4].parse::<i32>().unwrap_or(0);
                        let rx = parts[5].parse::<i32>().unwrap_or(0);
                        let ry = parts[6].parse::<i32>().unwrap_or(0);
                        Some(CollisionShape::Ellipse { cx, cy, rx, ry })
                    } else {
                        None
                    }
                }
                "polygon" => {
                    let mut vertices = Vec::new();
                    let mut i = 3;
                    while i + 1 < parts.len() {
                        if let (Ok(vx), Ok(vy)) =
                            (parts[i].parse::<i32>(), parts[i + 1].parse::<i32>())
                        {
                            vertices.push((vx, vy));
                        }
                        i += 2;
                    }
                    if vertices.len() >= 3 {
                        Some(CollisionShape::Polygon { vertices })
                    } else {
                        None
                    }
                }
                _ => None,
            };

            if let Some(shape) = shape {
                let col = CollisionArea {
                    id: Some(id),
                    name,
                    shape,
                };

                for s in current_surfaces {
                    collisions.entry(s.clone()).or_default().push(col.clone());
                }
            }
        }
    } else if lower.starts_with("collision") {
        let parts: Vec<&str> = trimmed.split(',').map(|s| s.trim()).collect();
        if parts.len() >= 6 {
            let id = parts[0]
                .trim_start_matches(|c: char| !c.is_ascii_digit())
                .parse::<i32>()
                .unwrap_or(0);
            let x1 = parts[1].parse::<i32>().unwrap_or(0);
            let y1 = parts[2].parse::<i32>().unwrap_or(0);
            let x2 = parts[3].parse::<i32>().unwrap_or(0);
            let y2 = parts[4].parse::<i32>().unwrap_or(0);
            let name = parts[5].to_ascii_lowercase();

            let col = CollisionArea {
                id: Some(id),
                name,
                shape: CollisionShape::Rect { x1, y1, x2, y2 },
            };

            for s in current_surfaces {
                collisions.entry(s.clone()).or_default().push(col.clone());
            }
        }
    }
}

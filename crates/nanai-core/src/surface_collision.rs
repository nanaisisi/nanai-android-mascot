//! サーフィス当たり判定 (Hit-Test) & 衝突計算エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "shape", rename_all = "lowercase")]
pub enum CollisionShape {
    Rect { x1: i32, y1: i32, x2: i32, y2: i32 },
    Circle { cx: i32, cy: i32, r: i32 },
    Ellipse { cx: i32, cy: i32, rx: i32, ry: i32 },
    Polygon { vertices: Vec<(i32, i32)> },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct CollisionArea {
    #[serde(default)]
    pub id: Option<i32>,
    pub name: String,
    pub shape: CollisionShape,
}

/// 単一衝突領域に対して指定座標 (x, y) がヒットしているか判定
pub fn is_point_inside_collision(collision: &CollisionArea, x: i32, y: i32) -> bool {
    match &collision.shape {
        CollisionShape::Rect { x1, y1, x2, y2 } => {
            let min_x = (*x1).min(*x2);
            let max_x = (*x1).max(*x2);
            let min_y = (*y1).min(*y2);
            let max_y = (*y1).max(*y2);
            x >= min_x && x <= max_x && y >= min_y && y <= max_y
        }
        CollisionShape::Circle { cx, cy, r } => {
            if *r <= 0 {
                return false;
            }
            let dx = (x - cx) as f64;
            let dy = (y - cy) as f64;
            let r_f = *r as f64;
            (dx * dx + dy * dy) <= (r_f * r_f)
        }
        CollisionShape::Ellipse { cx, cy, rx, ry } => {
            if *rx <= 0 || *ry <= 0 {
                return false;
            }
            let dx = (x - cx) as f64 / (*rx as f64);
            let dy = (y - cy) as f64 / (*ry as f64);
            (dx * dx + dy * dy) <= 1.0
        }
        CollisionShape::Polygon { vertices } => {
            if vertices.len() < 3 {
                return false;
            }
            let mut inside = false;
            let n = vertices.len();
            let mut j = n - 1;
            for i in 0..n {
                let (xi, yi) = (vertices[i].0 as f64, vertices[i].1 as f64);
                let (xj, yj) = (vertices[j].0 as f64, vertices[j].1 as f64);
                let x_f = x as f64;
                let y_f = y as f64;

                if (yi > y_f) != (yj > y_f) && (x_f < (xj - xi) * (y_f - yi) / (yj - yi) + xi) {
                    inside = !inside;
                }
                j = i;
            }
            inside
        }
    }
}

/// 複数当たり判定領域の中からヒットした領域名 (name) を返却
pub fn find_hit_collision_name(collisions: &[CollisionArea], x: i32, y: i32) -> Option<String> {
    for col in collisions {
        if is_point_inside_collision(col, x, y) {
            return Some(col.name.clone());
        }
    }
    None
}

#[wasm_bindgen]
pub fn wasm_find_hit_collision_name(
    collisions_js: JsValue,
    x: i32,
    y: i32,
) -> Result<JsValue, JsValue> {
    let collisions: Vec<CollisionArea> = serde_wasm_bindgen::from_value(collisions_js)?;
    let hit_name = find_hit_collision_name(&collisions, x, y);
    Ok(serde_wasm_bindgen::to_value(&hit_name)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rect_collision() {
        let area = CollisionArea {
            id: Some(0),
            name: "Head".to_string(),
            shape: CollisionShape::Rect {
                x1: 10,
                y1: 10,
                x2: 50,
                y2: 50,
            },
        };

        assert!(is_point_inside_collision(&area, 20, 20));
        assert!(!is_point_inside_collision(&area, 5, 20));
        assert!(!is_point_inside_collision(&area, 60, 20));
    }

    #[test]
    fn test_circle_collision() {
        let area = CollisionArea {
            id: Some(1),
            name: "Bust".to_string(),
            shape: CollisionShape::Circle {
                cx: 100,
                cy: 100,
                r: 20,
            },
        };

        assert!(is_point_inside_collision(&area, 100, 100));
        assert!(is_point_inside_collision(&area, 110, 100));
        assert!(!is_point_inside_collision(&area, 130, 100));
    }

    #[test]
    fn test_find_hit_collision_name() {
        let collisions = vec![
            CollisionArea {
                id: Some(0),
                name: "Head".to_string(),
                shape: CollisionShape::Rect {
                    x1: 0,
                    y1: 0,
                    x2: 50,
                    y2: 50,
                },
            },
            CollisionArea {
                id: Some(1),
                name: "Bust".to_string(),
                shape: CollisionShape::Rect {
                    x1: 0,
                    y1: 51,
                    x2: 50,
                    y2: 100,
                },
            },
        ];

        assert_eq!(
            find_hit_collision_name(&collisions, 20, 20),
            Some("Head".to_string())
        );
        assert_eq!(
            find_hit_collision_name(&collisions, 20, 70),
            Some("Bust".to_string())
        );
        assert_eq!(find_hit_collision_name(&collisions, 200, 200), None);
    }
}

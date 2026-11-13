//! 当たり判定の型

use serde::{Deserialize, Serialize};

/// collision の形状（`rect` 固定5点 / `polygon` 多角形 / `circle` / `ellipse`）
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum CollisionShape {
    /// 矩形（始点X, 始点Y, 終点X, 終点Y）
    Rect { x1: i32, y1: i32, x2: i32, y2: i32 },
    /// 多角形（頂点座標列）
    Polygon { vertices: Vec<(i32, i32)> },
    /// 円（中心X, 中心Y, 半径）
    Circle { cx: i32, cy: i32, r: f64 },
    /// 楕円（中心X, 中心Y, 半径X, 半径Y）
    Ellipse { cx: i32, cy: i32, rx: f64, ry: f64 },
}

impl CollisionShape {
    /// 座標がこの shape に含まれるか（矩形内側 or 多角形の奇偶規則 or 円・楕円の式）
    /// AABB（Axis-Aligned Bounding Box）による事前判定でモバイル・タッチ等のホットパスを高速化する
    pub fn contains(&self, x: i32, y: i32) -> bool {
        let fx = x as f64;
        let fy = y as f64;
        match self {
            CollisionShape::Rect { x1, y1, x2, y2 } => {
                let (x1, y1, x2, y2) = (*x1, *y1, *x2, *y2);
                x >= x1.min(x2) && x <= x1.max(x2) && y >= y1.min(y2) && y <= y1.max(y2)
            }
            CollisionShape::Polygon { vertices } if vertices.len() >= 3 => {
                // AABB事前フィルタ
                if let Some((min_x, min_y, max_x, max_y)) = self.bounding_box()
                    && (x < min_x || x > max_x || y < min_y || y > max_y)
                {
                    return false;
                }
                let mut inside = false;
                let n = vertices.len();
                let mut j = n - 1;
                for i in 0..n {
                    let (xi, yi) = vertices[i];
                    let (xj, yj) = vertices[j];
                    if ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
                        inside = !inside;
                    }
                    j = i;
                }
                inside
            }
            CollisionShape::Circle { cx, cy, r } => {
                if *r <= 0.0 {
                    return false;
                }
                // AABB事前フィルタ
                let ri = r.ceil() as i32;
                if x < cx - ri || x > cx + ri || y < cy - ri || y > cy + ri {
                    return false;
                }
                let (dx, dy) = (fx - *cx as f64, fy - *cy as f64);
                dx * dx + dy * dy <= *r * *r
            }
            CollisionShape::Ellipse { cx, cy, rx, ry } => {
                if *rx <= 0.0 || *ry <= 0.0 {
                    return false;
                }
                // AABB事前フィルタ
                let rxi = rx.ceil() as i32;
                let ryi = ry.ceil() as i32;
                if x < cx - rxi || x > cx + rxi || y < cy - ryi || y > cy + ryi {
                    return false;
                }
                let (dx, dy) = ((fx - *cx as f64) / *rx, (fy - *cy as f64) / *ry);
                dx * dx + dy * dy <= 1.0
            }
            _ => false,
        }
    }

    /// 形状を包含するバウンディングボックス `(x1, y1, x2, y2)` を計算する
    pub fn bounding_box(&self) -> Option<(i32, i32, i32, i32)> {
        match self {
            CollisionShape::Rect { x1, y1, x2, y2 } => {
                Some((*x1.min(x2), *y1.min(y2), *x1.max(x2), *y1.max(y2)))
            }
            CollisionShape::Polygon { vertices } if !vertices.is_empty() => {
                let mut min_x = i32::MAX;
                let mut max_x = i32::MIN;
                let mut min_y = i32::MAX;
                let mut max_y = i32::MIN;
                for &(x, y) in vertices {
                    min_x = min_x.min(x);
                    max_x = max_x.max(x);
                    min_y = min_y.min(y);
                    max_y = max_y.max(y);
                }
                Some((min_x, min_y, max_x, max_y))
            }
            CollisionShape::Circle { cx, cy, r } if *r > 0.0 => {
                let ri = r.ceil() as i32;
                Some((cx - ri, cy - ri, cx + ri, cy + ri))
            }
            CollisionShape::Ellipse { cx, cy, rx, ry } if *rx > 0.0 && *ry > 0.0 => {
                let rxi = rx.ceil() as i32;
                let ryi = ry.ceil() as i32;
                Some((cx - rxi, cy - ryi, cx + rxi, cy + ryi))
            }
            _ => None,
        }
    }
}

/// 一つの当たり判定領域
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CollisionArea {
    /// `collision[N]` 形式時の通しID（collisionex では省略され得る）
    pub id: Option<u32>,
    /// 部位名（head, bust, skirt...）
    pub name: String,
    pub shape: CollisionShape,
}

impl CollisionArea {
    /// 座標が当たり判定領域内にあるか
    pub fn contains(&self, x: i32, y: i32) -> bool {
        self.shape.contains(x, y)
    }
}

/// ヒットテストの結果情報
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HitTestResult {
    /// 当たり判定ID（定義されている場合）
    pub id: Option<u32>,
    /// 部位名（head, bust, skirt...）
    pub name: String,
    /// クリックされたサーフィス内相対X座標
    pub x: i32,
    /// クリックされたサーフィス内相対Y座標
    pub y: i32,
}

impl HitTestResult {
    pub fn new(area: &CollisionArea, x: i32, y: i32) -> Self {
        Self {
            id: area.id,
            name: area.name.clone(),
            x,
            y,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collision_shapes_contains() {
        // Rect
        let rect = CollisionShape::Rect {
            x1: 0,
            y1: 0,
            x2: 10,
            y2: 10,
        };
        assert!(rect.contains(5, 5));
        assert!(!rect.contains(15, 5));

        // Polygon
        let poly = CollisionShape::Polygon {
            vertices: vec![(0, 0), (10, 0), (10, 10), (0, 10)],
        };
        assert!(poly.contains(5, 5));
        assert!(!poly.contains(15, 5));
        let poly_empty = CollisionShape::Polygon { vertices: vec![] };
        assert!(!poly_empty.contains(0, 0));

        // Circle
        let circle = CollisionShape::Circle {
            cx: 0,
            cy: 0,
            r: 10.0,
        };
        assert!(circle.contains(0, 0));
        assert!(!circle.contains(20, 20));
        let zero_circle = CollisionShape::Circle {
            cx: 0,
            cy: 0,
            r: 0.0,
        };
        assert!(!zero_circle.contains(0, 0));

        // Ellipse
        let ellipse = CollisionShape::Ellipse {
            cx: 0,
            cy: 0,
            rx: 10.0,
            ry: 5.0,
        };
        assert!(ellipse.contains(0, 0));
        assert!(!ellipse.contains(20, 20));
        let zero_ellipse = CollisionShape::Ellipse {
            cx: 0,
            cy: 0,
            rx: 0.0,
            ry: 5.0,
        };
        assert!(!zero_ellipse.contains(0, 0));

        // CollisionArea helper
        let area = CollisionArea {
            id: Some(1),
            name: "Body".into(),
            shape: rect,
        };
        assert!(area.contains(5, 5));
    }
}

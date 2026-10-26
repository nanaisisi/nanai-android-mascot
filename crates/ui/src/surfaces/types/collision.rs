//! 当たり判定の型

use serde::{Deserialize, Serialize};

/// collision の形状（`rect` 固定5点 / `polygon` 多角形）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CollisionShape {
    /// 矩形（始点X, 始点Y, 終点X, 終点Y）
    Rect { x1: i32, y1: i32, x2: i32, y2: i32 },
    /// 多角形（頂点座標列）
    Polygon { vertices: Vec<(i32, i32)> },
}

impl CollisionShape {
    /// 座標がこの shape に含まれるか（矩形内側 or 多角形の奇偶規則）
    pub fn contains(&self, x: i32, y: i32) -> bool {
        match self {
            CollisionShape::Rect { x1, y1, x2, y2 } => {
                let (x1, y1, x2, y2) = (*x1, *y1, *x2, *y2);
                x >= x1.min(x2) && x <= x1.max(x2) && y >= y1.min(y2) && y <= y1.max(y2)
            }
            CollisionShape::Polygon { vertices } if vertices.len() >= 3 => {
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
            _ => false,
        }
    }
}

/// 一つの当たり判定領域
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
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

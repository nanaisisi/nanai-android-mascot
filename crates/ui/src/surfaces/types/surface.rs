//! サーフィス構成要素の型

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use super::collision::{CollisionArea, HitTestResult};
use super::draw::DrawMethod;

pub use super::animation::{AnimationPattern, SerikoAnimation};

/// `element[N]` の1行分の定義
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ElementDef {
    pub id: u32,
    pub method: DrawMethod,
    /// 描画する画像ファイル（シェル相対パス）
    pub file: String,
    pub x: i32,
    pub y: i32,
    /// 追加オプション（トリミング等）
    pub options: Vec<String>,
}

/// サーフィスの基準点情報（`point.*`）
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Points {
    pub center_x: Option<i32>,
    pub center_y: Option<i32>,
    pub basepos_x: Option<i32>,
    pub basepos_y: Option<i32>,
    pub kinoko_center_x: Option<i32>,
    pub kinoko_center_y: Option<i32>,
}

/// バルーン位置オフセット（`<char>.balloon.offsetx/y` / `balloon.offsetx/y`）
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct BalloonOffset {
    pub x: Option<i32>,
    pub y: Option<i32>,
}

/// `surface[N]` / `surface.append[N]` の1サーフィス分の定義
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfaceDefinition {
    pub elements: Vec<ElementDef>,
    pub collisions: Vec<CollisionArea>,
    /// アニメーション定義（ID 順）
    pub animations: BTreeMap<u32, SerikoAnimation>,
    pub points: Points,
    /// キーは `sakura` / `kero` / `*`（共通指定）
    pub balloon_offsets: BTreeMap<String, BalloonOffset>,
    /// サーフィス表示名（`name,`）
    pub name: Option<String>,
    /// 顔サムネイル切り出し矩形（`icon.rect,始点X,始点Y,終点X,終点Y`）
    #[serde(default)]
    pub icon_rect: Option<[i32; 4]>,
    /// 未分類のキー・バリュー（拡張記載の退避先）
    pub properties: BTreeMap<String, String>,
}

impl SurfaceDefinition {
    /// 顔サムネイル矩形を取得する。
    /// 明示指定（`icon.rect`）があればそれを長辺基準で正方形に整形して採用する。
    /// 未指定の場合は `face` または `head` の当たり判定（collision）から自動検出する。
    pub fn effective_icon_rect(&self) -> Option<[i32; 4]> {
        if let Some([x1, y1, x2, y2]) = self.icon_rect {
            return Some(make_square_rect(x1, y1, x2, y2));
        }

        // face または head の collision を検索
        let area = self
            .collisions
            .iter()
            .find(|c| c.name.eq_ignore_ascii_case("face") || c.name.eq_ignore_ascii_case("顔"))
            .or_else(|| {
                self.collisions.iter().find(|c| {
                    c.name.eq_ignore_ascii_case("head") || c.name.eq_ignore_ascii_case("頭")
                })
            })?;

        let (x1, y1, x2, y2) = area.shape.bounding_box()?;
        Some(make_square_rect(x1, y1, x2, y2))
    }

    /// 座標に該当する当たり判定（先に定義されたものを優先）を返す
    pub fn hit_test(&self, x: i32, y: i32) -> Option<&CollisionArea> {
        self.collisions.iter().find(|c| c.contains(x, y))
    }

    /// ソート順（collision-sort: ascend / descend / none / id 等）を考慮してヒットテストを行う
    pub fn hit_test_sorted(
        &self,
        x: i32,
        y: i32,
        sort: Option<&SortKind>,
    ) -> Option<HitTestResult> {
        match sort {
            Some(SortKind::Ascend) => {
                let mut candidates: Vec<&CollisionArea> = self
                    .collisions
                    .iter()
                    .filter(|c| c.contains(x, y))
                    .collect();
                candidates.sort_by_key(|c| c.id.unwrap_or(u32::MAX));
                candidates.first().map(|c| HitTestResult::new(c, x, y))
            }
            Some(SortKind::Descend) => {
                let mut candidates: Vec<&CollisionArea> = self
                    .collisions
                    .iter()
                    .filter(|c| c.contains(x, y))
                    .collect();
                candidates.sort_by_key(|c| std::cmp::Reverse(c.id.unwrap_or(0)));
                candidates.first().map(|c| HitTestResult::new(c, x, y))
            }
            Some(SortKind::Id) => {
                let mut candidates: Vec<&CollisionArea> = self
                    .collisions
                    .iter()
                    .filter(|c| c.contains(x, y))
                    .collect();
                candidates.sort_by_key(|c| c.id.unwrap_or(u32::MAX));
                candidates.first().map(|c| HitTestResult::new(c, x, y))
            }
            _ => self.hit_test(x, y).map(|c| HitTestResult::new(c, x, y)),
        }
    }

    /// 指定 elementID の要素を取得
    pub fn element(&self, id: u32) -> Option<&ElementDef> {
        self.elements.iter().find(|e| e.id == id)
    }
}

/// 指定矩形を、中心を維持したまま長辺基準の正方形に整形する
pub fn make_square_rect(x1: i32, y1: i32, x2: i32, y2: i32) -> [i32; 4] {
    let min_x = x1.min(x2);
    let max_x = x1.max(x2);
    let min_y = y1.min(y2);
    let max_y = y1.max(y2);

    let w = max_x - min_x;
    let h = max_y - min_y;

    if w == h {
        return [min_x, min_y, max_x, max_y];
    }

    let side = w.max(h);
    let center_x = (min_x + max_x) / 2;
    let center_y = (min_y + max_y) / 2;

    let half = side / 2;
    let new_x1 = center_x - half;
    let new_y1 = center_y - half;
    let new_x2 = new_x1 + side;
    let new_y2 = new_y1 + side;

    [new_x1, new_y1, new_x2, new_y2]
}

/// `descript` ブロックの `animation.sort` / `collision.sort` 値
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SortKind {
    /// `none`：記述順
    None,
    /// `ascend`：ID昇順 (1, 2, 3...)
    Ascend,
    /// `descend`：ID降順 (10, 9, 8...)
    Descend,
    /// `id`：アニメーションID順（ collision は当たり判定ID順）
    Id,
    /// `unique-junk`：ジャンクな重複を弾く
    UniqueJunk,
    /// `u-scoped`：U スコープ順
    UScoped,
    /// その他の拡張値
    Custom(String),
}

impl SortKind {
    pub fn parse(value: &str) -> Self {
        let v = value.trim().to_lowercase();
        match v.as_str() {
            "none" => Self::None,
            "ascend" => Self::Ascend,
            "descend" => Self::Descend,
            "id" => Self::Id,
            "unique-junk" => Self::UniqueJunk,
            "u-scoped" => Self::UScoped,
            other => Self::Custom(other.to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::surfaces::types::{CollisionShape, DrawMethod};

    #[test]
    fn test_surface_definition_methods() {
        let elem = ElementDef {
            id: 1,
            method: DrawMethod::Overlay,
            file: "face.png".into(),
            x: 0,
            y: 0,
            options: vec![],
        };
        let area = CollisionArea {
            id: Some(0),
            name: "Head".into(),
            shape: CollisionShape::Rect {
                x1: 0,
                y1: 0,
                x2: 100,
                y2: 100,
            },
        };

        let mut def = SurfaceDefinition::default();
        def.elements.push(elem);
        def.collisions.push(area);

        assert!(def.hit_test(50, 50).is_some());
        assert!(def.hit_test(200, 200).is_none());
        assert_eq!(def.element(1).unwrap().file, "face.png");
        assert!(def.element(99).is_none());

        assert_eq!(SortKind::parse("id"), SortKind::Id);
        assert_eq!(SortKind::parse("unique-junk"), SortKind::UniqueJunk);
        assert_eq!(SortKind::parse("u-scoped"), SortKind::UScoped);
        assert_eq!(SortKind::parse("other"), SortKind::Custom("other".into()));
    }

    #[test]
    fn test_surface_definition_effective_icon_rect_and_sorting() {
        let mut def = SurfaceDefinition::default();

        // 1. Explicit icon_rect
        def.icon_rect = Some([10, 20, 110, 70]);
        let rect = def.effective_icon_rect().unwrap();
        assert_eq!(rect[2] - rect[0], rect[3] - rect[1]); // Square

        // 2. Fallback to "face" collision
        def.icon_rect = None;
        def.collisions.push(CollisionArea {
            id: Some(2),
            name: "face".into(),
            shape: CollisionShape::Rect {
                x1: 0,
                y1: 0,
                x2: 50,
                y2: 50,
            },
        });
        def.collisions.push(CollisionArea {
            id: Some(1),
            name: "head".into(),
            shape: CollisionShape::Rect {
                x1: 0,
                y1: 0,
                x2: 100,
                y2: 100,
            },
        });

        assert_eq!(def.effective_icon_rect().unwrap(), [0, 0, 50, 50]);

        // 3. hit_test_sorted: Ascend & Descend
        let res_asc = def
            .hit_test_sorted(25, 25, Some(&SortKind::Ascend))
            .unwrap();
        assert_eq!(res_asc.name, "head"); // ID 1

        let res_desc = def
            .hit_test_sorted(25, 25, Some(&SortKind::Descend))
            .unwrap();
        assert_eq!(res_desc.name, "face"); // ID 2

        let res_id = def.hit_test_sorted(25, 25, Some(&SortKind::Id)).unwrap();
        assert_eq!(res_id.name, "head"); // ID 1
    }

    #[test]
    fn test_surface_definition_more_edge_cases() {
        let def = SurfaceDefinition::default();
        assert!(def.effective_icon_rect().is_none());

        let mut def2 = SurfaceDefinition::default();
        def2.collisions.push(CollisionArea {
            id: Some(1),
            name: "顔".into(),
            shape: CollisionShape::Rect {
                x1: 0,
                y1: 0,
                x2: 50,
                y2: 50,
            },
        });
        assert!(def2.effective_icon_rect().is_some());

        let mut def3 = SurfaceDefinition::default();
        def3.collisions.push(CollisionArea {
            id: Some(1),
            name: "頭".into(),
            shape: CollisionShape::Rect {
                x1: 0,
                y1: 0,
                x2: 50,
                y2: 50,
            },
        });
        assert!(def3.effective_icon_rect().is_some());

        let mut def4 = SurfaceDefinition::default();
        def4.collisions.push(CollisionArea {
            id: Some(1),
            name: "face".into(),
            shape: CollisionShape::Circle {
                cx: 0,
                cy: 0,
                r: 0.0,
            },
        });
        assert!(def4.effective_icon_rect().is_none());

        let square = make_square_rect(0, 0, 50, 50);
        assert_eq!(square, [0, 0, 50, 50]);

        let hit = def2.hit_test_sorted(25, 25, Some(&SortKind::None));
        assert!(hit.is_some());
    }
}

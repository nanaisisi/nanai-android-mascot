//! SurfaceDefinition 構造体およびヒットテスト・顔領域取得メソッド実装モジュール

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use super::elements::{BalloonOffset, ElementDef, Points, SortKind, make_square_rect};
use crate::surfaces::types::animation::SerikoAnimation;
use crate::surfaces::types::collision::{CollisionArea, HitTestResult};

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

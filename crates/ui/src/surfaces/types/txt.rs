//! `surfaces.txt` 全体のパース結果型

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use super::collision::HitTestResult;
use super::surface::{AnimationPattern, ElementDef, SortKind, SurfaceDefinition};
use super::{CompositionLayer, CompositionPlan};

/// `surfaces.txt` のパース結果
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SurfacesTxt {
    /// `charset,` 指定（例: Shift_JIS）
    pub charset: Option<String>,
    /// `descript` ブロック内の `version,` 指定（0: 旧形式 / 1: 新形式・推奨）
    pub version: u32,
    /// `descript` ブロック内の `maxwidth,`
    pub maxwidth: Option<i32>,
    pub animation_sort: Option<SortKind>,
    pub collision_sort: Option<SortKind>,
    /// サーフィス番号 → 定義
    pub surfaces: BTreeMap<u32, SurfaceDefinition>,
    /// `surface.alias` ブロックの エイリアス名 → サーフィス番号列
    pub aliases: BTreeMap<String, Vec<u32>>,
    /// `kero.surface.alias` / `char1.surface.alias` ブロックのエイリアス名 → 番号列
    #[serde(default)]
    pub kero_aliases: BTreeMap<String, Vec<u32>>,
    /// ルート（ブロック外）の未分類キー・バリュー
    pub properties: BTreeMap<String, String>,
}

impl SurfacesTxt {
    /// テキスト内容から `surfaces.txt` をパースする
    pub fn parse(text: &str) -> Self {
        crate::surfaces::parser::parse_surfaces_txt(text)
    }

    /// サーフィス番号に対応する定義を取得
    pub fn surface(&self, number: u32) -> Option<&SurfaceDefinition> {
        self.surfaces.get(&number)
    }

    /// 合成計画（MAYUNA / 着せ替え表示のレイヤー列）を立てる
    pub fn plan_composition(&self, number: u32, binds: &[u32]) -> Option<CompositionPlan> {
        use super::draw::Interval;

        let def = self.surface(number)?;

        let mut elements: Vec<&ElementDef> = def.elements.iter().collect();
        elements.sort_by_key(|e| e.id);

        let mut layers: Vec<CompositionLayer> = elements
            .into_iter()
            .cloned()
            .map(CompositionLayer::Element)
            .collect();

        let mut bind_ids: Vec<u32> = binds.to_vec();
        bind_ids.sort_unstable();
        for bind_id in bind_ids {
            let Some(anim) = def.animations.get(&bind_id) else {
                continue;
            };
            if anim.interval.as_ref() != Some(&Interval::Bind) {
                continue;
            }
            let mut patterns: Vec<&AnimationPattern> = anim.patterns.iter().collect();
            patterns.sort_by_key(|p| p.index);
            layers.extend(patterns.into_iter().cloned().map(CompositionLayer::Pattern));
        }

        Some(CompositionPlan {
            surface: number,
            layers,
        })
    }

    /// エイリアス名に対応するサーフィス番号列を取得
    pub fn alias_numbers(&self, name: &str) -> Option<&Vec<u32>> {
        for (key, list) in &self.aliases {
            if key.eq_ignore_ascii_case(name) {
                return Some(list);
            }
        }
        None
    }

    /// 相方（kero / char1）のエイリアス名に対応するサーフィス番号列を取得
    pub fn kero_alias_numbers(&self, name: &str) -> Option<&Vec<u32>> {
        for (key, list) in &self.kero_aliases {
            if key.eq_ignore_ascii_case(name) {
                return Some(list);
            }
        }
        None
    }

    /// エイリアス名から最初の有効なサーフィス定義を解決する
    pub fn resolve_alias(&self, name: &str) -> Option<&SurfaceDefinition> {
        let list = self.alias_numbers(name)?;
        list.iter().find_map(|n| self.surfaces.get(n))
    }

    /// 相方（kero / char1）のエイリアス名から最初の有効なサーフィス定義を解決する
    pub fn resolve_kero_alias(&self, name: &str) -> Option<&SurfaceDefinition> {
        let list = self.kero_alias_numbers(name)?;
        list.iter().find_map(|n| self.surfaces.get(n))
    }

    /// 当たり判定のヒットテスト（`collision.sort` 設定を適用）
    pub fn hit_test(&self, surface_id: u32, x: i32, y: i32) -> Option<HitTestResult> {
        let def = self.surface(surface_id)?;
        def.hit_test_sorted(x, y, self.collision_sort.as_ref())
    }

    /// バインド（着せ替えパーツ）のアニメーション当たり判定も含めてヒットテストを行う
    pub fn hit_test_with_binds(
        &self,
        surface_id: u32,
        x: i32,
        y: i32,
        binds: &[u32],
    ) -> Option<HitTestResult> {
        let def = self.surface(surface_id)?;

        // バインドされたアニメーションの当たり判定を手前に判定
        for &bind_id in binds {
            if let Some(anim) = def.animations.get(&bind_id) {
                for area in anim.collisions.iter().rev() {
                    if area.contains(x, y) {
                        return Some(HitTestResult::new(area, x, y));
                    }
                }
            }
        }

        // ベースサーフィスの当たり判定
        self.hit_test(surface_id, x, y)
    }

    /// `surfaces2.txt` 等の上位定義でマージ（上書き・追記）する
    pub fn merge(&mut self, other: SurfacesTxt) {
        if other.charset.is_some() {
            self.charset = other.charset;
        }
        if other.version > 0 {
            self.version = other.version;
        }
        if other.maxwidth.is_some() {
            self.maxwidth = other.maxwidth;
        }
        if other.animation_sort.is_some() {
            self.animation_sort = other.animation_sort;
        }
        if other.collision_sort.is_some() {
            self.collision_sort = other.collision_sort;
        }

        for (k, v) in other.properties {
            self.properties.insert(k, v);
        }

        for (alias, list) in other.aliases {
            self.aliases.insert(alias, list);
        }

        for (alias, list) in other.kero_aliases {
            self.kero_aliases.insert(alias, list);
        }

        for (num, other_def) in other.surfaces {
            use std::collections::btree_map::Entry;
            match self.surfaces.entry(num) {
                Entry::Vacant(v) => {
                    v.insert(other_def);
                }
                Entry::Occupied(mut occ) => {
                    let cur = occ.get_mut();
                    if other_def.name.is_some() {
                        cur.name = other_def.name;
                    }
                    if other_def.points.center_x.is_some() {
                        cur.points.center_x = other_def.points.center_x;
                    }
                    if other_def.points.center_y.is_some() {
                        cur.points.center_y = other_def.points.center_y;
                    }
                    if other_def.points.basepos_x.is_some() {
                        cur.points.basepos_x = other_def.points.basepos_x;
                    }
                    if other_def.points.basepos_y.is_some() {
                        cur.points.basepos_y = other_def.points.basepos_y;
                    }
                    if other_def.points.kinoko_center_x.is_some() {
                        cur.points.kinoko_center_x = other_def.points.kinoko_center_x;
                    }
                    if other_def.points.kinoko_center_y.is_some() {
                        cur.points.kinoko_center_y = other_def.points.kinoko_center_y;
                    }

                    for (k, v) in other_def.balloon_offsets {
                        cur.balloon_offsets.insert(k, v);
                    }
                    for (k, v) in other_def.properties {
                        cur.properties.insert(k, v);
                    }
                    for (id, other_anim) in other_def.animations {
                        match cur.animations.entry(id) {
                            Entry::Vacant(v) => {
                                v.insert(other_anim);
                            }
                            Entry::Occupied(mut occ_anim) => {
                                let a = occ_anim.get_mut();
                                if other_anim.interval.is_some() {
                                    a.interval = other_anim.interval;
                                }
                                if other_anim.name.is_some() {
                                    a.name = other_anim.name;
                                }
                                a.patterns.extend(other_anim.patterns);
                                a.collisions.extend(other_anim.collisions);
                                a.options.extend(other_anim.options);
                            }
                        }
                    }
                    cur.elements.extend(other_def.elements);
                    cur.collisions.extend(other_def.collisions);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::surfaces::types::SurfaceDefinition;

    #[test]
    fn test_surfaces_txt_methods() {
        let mut txt = SurfacesTxt::default();
        let mut def = SurfaceDefinition::default();
        def.name = Some("Surface0".into());
        txt.surfaces.insert(0, def);

        txt.aliases.insert("main".into(), vec![0]);
        txt.kero_aliases.insert("kero_main".into(), vec![0]);

        assert!(txt.surface(0).is_some());
        assert!(txt.alias_numbers("MAIN").is_some());
        assert!(txt.alias_numbers("UNKNOWN").is_none());

        assert!(txt.kero_alias_numbers("KERO_MAIN").is_some());
        assert!(txt.kero_alias_numbers("UNKNOWN").is_none());

        assert!(txt.resolve_alias("MAIN").is_some());
        assert!(txt.resolve_alias("UNKNOWN").is_none());

        assert!(txt.resolve_kero_alias("KERO_MAIN").is_some());
        assert!(txt.resolve_kero_alias("UNKNOWN").is_none());
    }

    #[test]
    fn test_plan_composition_bind_and_unmapped() {
        use crate::surfaces::types::{AnimationPattern, DrawMethod, Interval, SerikoAnimation};

        let mut txt = SurfacesTxt::default();
        let mut def = SurfaceDefinition::default();

        let mut bind_anim = SerikoAnimation::default();
        bind_anim.id = 100;
        bind_anim.interval = Some(Interval::Bind);
        bind_anim.patterns.push(AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 20,
            wait: 85,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        });

        let mut always_anim = SerikoAnimation::default();
        always_anim.id = 101;
        always_anim.interval = Some(Interval::Always);

        def.animations.insert(100, bind_anim);
        def.animations.insert(101, always_anim);

        txt.surfaces.insert(0, def);

        let plan = txt.plan_composition(0, &[100, 101, 999]).unwrap();
        assert_eq!(plan.bind_pattern_count(), 1);
        assert_eq!(plan.layer_files(), vec!["20"]);
        assert!(txt.plan_composition(999, &[]).is_none());
    }
}

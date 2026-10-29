//! `surfaces.txt` 全体のパース結果型

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

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

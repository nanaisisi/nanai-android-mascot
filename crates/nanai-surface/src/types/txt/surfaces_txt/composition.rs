use super::SurfacesTxt;
use crate::types::draw::{DrawMethod, Interval};
use crate::types::{AnimationPattern, CompositionLayer, CompositionPlan, ElementDef};
use std::collections::HashSet;

impl SurfacesTxt {
    /// 合成計画（MAYUNA / 着せ替え表示のレイヤー列）を立てる
    /// `insert,ID` 指定された着せ替えグループ（intervalがbind）のインライン挿入に対応
    pub fn plan_composition(&self, number: u32, binds: &[u32]) -> Option<CompositionPlan> {
        let def = self.surface(number)?;

        let mut elements: Vec<&ElementDef> = def.elements.iter().collect();
        elements.sort_by_key(|e| e.id);

        let mut layers: Vec<CompositionLayer> = elements
            .into_iter()
            .cloned()
            .map(CompositionLayer::Element)
            .collect();

        let active_binds_set: HashSet<u32> = binds.iter().copied().collect();
        let mut bind_ids: Vec<u32> = binds.to_vec();
        bind_ids.sort_unstable();

        // どのbindアニメーションが他からinsertされているかを収集
        let mut inserted_ids = HashSet::new();
        for &bind_id in &bind_ids {
            if let Some(anim) = def.animations.get(&bind_id)
                && anim.interval.as_ref() == Some(&Interval::Bind)
            {
                for pat in &anim.patterns {
                    if pat.method == DrawMethod::Insert
                        && let Ok(target_id) = pat.surface.to_string().parse::<u32>()
                    {
                        inserted_ids.insert(target_id);
                    }
                }
            }
        }

        // トップレベルのbindグループ（他からinsertされていないもの）から展開
        let mut visited = HashSet::new();
        for bind_id in bind_ids {
            if inserted_ids.contains(&bind_id) {
                // 他の着せ替えから insert される予定なのでトップレベルではスキップ
                continue;
            }
            let Some(anim) = def.animations.get(&bind_id) else {
                continue;
            };
            if anim.interval.as_ref() != Some(&Interval::Bind) {
                continue;
            }

            self.expand_bind_animation(def, bind_id, &active_binds_set, &mut visited, &mut layers);
        }

        Some(CompositionPlan {
            surface: number,
            layers,
        })
    }

    /// 単一の着せ替えアニメーションを展開し、insert パターンがあれば再帰的に展開して layers に追加
    fn expand_bind_animation(
        &self,
        def: &crate::SurfaceDefinition,
        anim_id: u32,
        active_binds: &HashSet<u32>,
        visited: &mut HashSet<u32>,
        out_layers: &mut Vec<CompositionLayer>,
    ) {
        if !visited.insert(anim_id) {
            return; // 循環参照防止
        }

        let Some(anim) = def.animations.get(&anim_id) else {
            return;
        };
        let mut patterns: Vec<&AnimationPattern> = anim.patterns.iter().collect();
        patterns.sort_by_key(|p| p.index);

        for pat in patterns {
            if pat.method == DrawMethod::Insert {
                if let Ok(child_id) = pat.surface.to_string().parse::<u32>() {
                    // insert先の着せ替えが現在装着中(ON)の場合のみ挿入
                    if active_binds.contains(&child_id) {
                        self.expand_bind_animation(
                            def,
                            child_id,
                            active_binds,
                            visited,
                            out_layers,
                        );
                    }
                }
            } else {
                out_layers.push(CompositionLayer::Pattern(pat.clone()));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plan_composition_none() {
        let txt = SurfacesTxt::default();
        assert!(txt.plan_composition(999, &[]).is_none());
    }

    #[test]
    fn test_plan_composition_edge_cases() {
        use crate::types::{AnimationPattern, SerikoAnimation, SurfaceDefinition};

        let mut txt = SurfacesTxt::default();
        let mut def = SurfaceDefinition::default();

        let anim1 = SerikoAnimation {
            id: 1,
            name: None,
            interval: Some(Interval::Bind),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Insert,
                surface: 2,
                wait: 0,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        };
        let anim2 = SerikoAnimation {
            id: 2,
            name: None,
            interval: Some(Interval::Bind),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 10,
                wait: 0,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        };
        let anim_non_bind = SerikoAnimation {
            id: 3,
            name: None,
            interval: Some(Interval::Always),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 11,
                wait: 0,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        };

        def.animations.insert(1, anim1);
        def.animations.insert(2, anim2);
        def.animations.insert(3, anim_non_bind);
        txt.surfaces.insert(0, def);

        let plan = txt.plan_composition(0, &[1, 2]);
        assert!(plan.is_some());

        let plan_inactive = txt.plan_composition(0, &[1]);
        assert!(plan_inactive.is_some());
    }
}

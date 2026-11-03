use super::SurfacesTxt;
use crate::surfaces::types::draw::{DrawMethod, Interval};
use crate::surfaces::types::{AnimationPattern, CompositionLayer, CompositionPlan, ElementDef};
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
        def: &crate::surfaces::SurfaceDefinition,
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
}

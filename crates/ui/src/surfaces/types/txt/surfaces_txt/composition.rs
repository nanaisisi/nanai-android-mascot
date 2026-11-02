use super::SurfacesTxt;
use crate::surfaces::types::draw::Interval;
use crate::surfaces::types::{AnimationPattern, CompositionLayer, CompositionPlan, ElementDef};

impl SurfacesTxt {
    /// 合成計画（MAYUNA / 着せ替え表示のレイヤー列）を立てる
    pub fn plan_composition(&self, number: u32, binds: &[u32]) -> Option<CompositionPlan> {
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
}

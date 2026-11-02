use super::super::active::ActiveAnimation;
use super::super::events::ParsedAnimationOptions;
use super::AnimationScheduler;
use crate::surfaces::SerikoAnimation;
use std::collections::HashMap;

impl AnimationScheduler {
    /// 現在のサーフィスを設定し、既存のアニメーションをクリア（shared-index 指定がないもの）
    pub fn set_surface(&mut self, scope_id: u32, surface_id: i32) {
        self.current_surfaces.insert(scope_id, surface_id);
        self.stop_animations(scope_id);
        self.animation_offsets.remove(&scope_id);
    }

    /// 現在のサーフィスを切り替え、新旧サーフィスの shared-index アニメーションの再生インデックスを継承する
    pub fn set_surface_with_shared_index(
        &mut self,
        scope_id: u32,
        new_surface_id: i32,
        new_animations: &[SerikoAnimation],
    ) {
        self.current_surfaces.insert(scope_id, new_surface_id);

        let mut preserved: HashMap<u32, usize> = HashMap::new();
        if let Some(active) = self.active_animations.get(&scope_id) {
            for a in active {
                if a.is_shared_index && !a.is_finished {
                    preserved.insert(a.animation_id, a.current_pattern_index);
                }
            }
        }

        self.stop_animations(scope_id);
        self.animation_offsets.remove(&scope_id);

        // 新サーフィス側にも shared-index 指定のアニメーションが存在すれば、保存した pattern index から復帰開始
        for anim in new_animations {
            let opts = ParsedAnimationOptions::from_raw_options(&anim.options);
            if opts.is_shared_index
                && let Some(&saved_index) = preserved.get(&anim.id)
                && saved_index < anim.patterns.len()
            {
                let mut active =
                    ActiveAnimation::new(anim.id, new_surface_id, anim.patterns.clone())
                        .with_options(&opts);
                active.current_pattern_index = saved_index;
                let anims = self.active_animations.entry(scope_id).or_default();
                anims.push(active);
            }
        }
    }

    /// 現在のサーフィスIDを取得
    pub fn current_surface(&self, scope_id: u32) -> i32 {
        self.current_surfaces
            .get(&scope_id)
            .copied()
            .unwrap_or(if scope_id == 1 { 10 } else { 0 })
    }

    /// 着せ替え (bind) の状態を更新
    pub fn set_bind_active(&mut self, scope_id: u32, bind_id: u32, active: bool) {
        let binds = self.active_binds.entry(scope_id).or_default();
        if active {
            binds.insert(bind_id);
        } else {
            binds.remove(&bind_id);
        }
    }

    pub fn is_bind_active(&self, scope_id: u32, bind_id: u32) -> bool {
        self.active_binds
            .get(&scope_id)
            .map(|b| b.contains(&bind_id))
            .unwrap_or(false)
    }

    /// アニメーションを一時停止
    pub fn pause_animation(&mut self, scope_id: u32, anim_id: u32) {
        self.paused_animations
            .entry(scope_id)
            .or_default()
            .insert(anim_id);
        if let Some(anims) = self.active_animations.get_mut(&scope_id) {
            for anim in anims.iter_mut() {
                if anim.animation_id == anim_id {
                    anim.is_paused = true;
                }
            }
        }
    }

    /// アニメーションを再開
    pub fn resume_animation(&mut self, scope_id: u32, anim_id: u32) {
        if let Some(set) = self.paused_animations.get_mut(&scope_id) {
            set.remove(&anim_id);
        }
        if let Some(anims) = self.active_animations.get_mut(&scope_id) {
            for anim in anims.iter_mut() {
                if anim.animation_id == anim_id {
                    anim.is_paused = false;
                }
            }
        }
    }

    /// アニメーションが一時停止中か
    pub fn is_animation_paused(&self, scope_id: u32, anim_id: u32) -> bool {
        self.paused_animations
            .get(&scope_id)
            .map(|set| set.contains(&anim_id))
            .unwrap_or(false)
    }

    /// 指定スコープの全アニメーションを停止
    pub fn stop_animations(&mut self, scope_id: u32) {
        self.active_animations.remove(&scope_id);
        self.paused_animations.remove(&scope_id);
    }

    /// 指定アニメーションを単独で停止 (\![anim,stop,ID] / \![anim,clear,ID])
    pub fn stop_animation(&mut self, scope_id: u32, anim_id: u32) {
        if let Some(anims) = self.active_animations.get_mut(&scope_id) {
            for a in anims.iter_mut() {
                if a.animation_id == anim_id {
                    a.is_finished = true;
                }
            }
            anims.retain(|a| !a.is_finished);
        }
    }

    /// 動的アニメーション座標オフセットを設定 (\![anim,offset,ID,x,y])
    pub fn set_animation_offset(&mut self, scope_id: u32, anim_id: u32, x: i32, y: i32) {
        let offsets = self.animation_offsets.entry(scope_id).or_default();
        offsets.insert(anim_id, (x, y));

        if let Some(anims) = self.active_animations.get_mut(&scope_id) {
            for a in anims.iter_mut() {
                if a.animation_id == anim_id {
                    a.offset_x = x;
                    a.offset_y = y;
                }
            }
        }
    }

    /// 動的アニメーション座標オフセットを取得
    pub fn get_animation_offset(&self, scope_id: u32, anim_id: u32) -> (i32, i32) {
        self.animation_offsets
            .get(&scope_id)
            .and_then(|m| m.get(&anim_id).copied())
            .unwrap_or((0, 0))
    }
}

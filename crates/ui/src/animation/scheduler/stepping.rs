use super::super::events::FrameStepEvent;
use super::AnimationScheduler;
use crate::surfaces::{DrawMethod, SerikoAnimation};

impl AnimationScheduler {
    /// 時間を経過させ、発生した全フレーム更新イベント（`FrameStepEvent`）を収集して返す
    pub fn step(&mut self, delta_ms: u32) -> Vec<FrameStepEvent> {
        self.step_with_catalog(delta_ms, &[])
    }

    /// 時間を経過させ、発生した全フレーム更新イベント（`FrameStepEvent`）を収集して返す
    /// アニメーション定義カタログを渡すことで、`start`, `stop`, `alternativestart` 等の制御メソッドに対応
    pub fn step_with_catalog(
        &mut self,
        delta_ms: u32,
        catalog: &[SerikoAnimation],
    ) -> Vec<FrameStepEvent> {
        let mut events = Vec::new();
        let mut to_start: Vec<(u32, u32)> = Vec::new(); // (scope_id, anim_id)
        let mut to_stop: Vec<(u32, u32)> = Vec::new(); // (scope_id, anim_id)

        for (&scope_id, anims) in self.active_animations.iter_mut() {
            let mut stop_others = false;

            for anim in anims.iter_mut() {
                if let Some(event) = anim.advance(delta_ms, scope_id) {
                    if event.pattern.surface == -2 {
                        // surface -2 はスコープ内の他のアニメーションを停止
                        stop_others = true;
                    }

                    // 描画メソッドに応じたアニメーション制御処理
                    match &event.pattern.method {
                        DrawMethod::Start(Some(target_id)) => {
                            to_start.push((scope_id, *target_id));
                        }
                        DrawMethod::Stop(Some(target_id)) => {
                            to_stop.push((scope_id, *target_id));
                        }
                        DrawMethod::ParallelStart(ids) => {
                            for id in ids {
                                to_start.push((scope_id, *id));
                            }
                        }
                        DrawMethod::ParallelStop(ids) => {
                            for id in ids {
                                to_stop.push((scope_id, *id));
                            }
                        }
                        DrawMethod::AlternativeStart(ids) => {
                            if let Some(first) = ids.first() {
                                to_start.push((scope_id, *first));
                            }
                        }
                        DrawMethod::AlternativeStop(ids) => {
                            if let Some(first) = ids.first() {
                                to_stop.push((scope_id, *first));
                            }
                        }
                        _ => {}
                    }

                    events.push(event);
                }
            }

            if stop_others {
                anims.retain(|a| a.is_finished || a.patterns.iter().any(|p| p.surface == -2));
            } else {
                anims.retain(|a| !a.is_finished);
            }
        }

        // 停止処理の反映
        for (scope_id, anim_id) in to_stop {
            self.stop_animation(scope_id, anim_id);
        }

        // 開始処理の反映
        if !catalog.is_empty() {
            for (scope_id, anim_id) in to_start {
                if let Some(anim_def) = catalog.iter().find(|a| a.id == anim_id) {
                    let base_surf = self.current_surface(scope_id);
                    self.start_animation(scope_id, base_surf, anim_def);
                }
            }
        }

        events
    }

    /// アクティブなアニメーション件数
    pub fn active_count(&self, scope_id: u32) -> usize {
        self.active_animations
            .get(&scope_id)
            .map(|a| a.iter().filter(|x| !x.is_finished).count())
            .unwrap_or(0)
    }
}

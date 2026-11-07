use super::super::active::ActiveAnimation;
use super::super::events::ParsedAnimationOptions;
use super::AnimationScheduler;
use crate::surfaces::{Interval, SerikoAnimation};

impl AnimationScheduler {
    /// 指定アニメーションが現在排他ロックにより開始をブロックされているか
    pub fn is_blocked_by_exclusive(&self, scope_id: u32, anim_id: u32) -> bool {
        if let Some(anims) = self.active_animations.get(&scope_id) {
            for a in anims {
                if a.is_exclusive && !a.is_finished {
                    if let Some(ref targets) = a.exclusive_targets {
                        if targets.contains(&anim_id) {
                            return true;
                        }
                    } else if a.animation_id != anim_id {
                        return true;
                    }
                }
            }
        }
        false
    }

    /// アニメーションを手動またはトリガーによって開始登録する
    pub fn start_animation(&mut self, scope_id: u32, base_surface_id: i32, anim: &SerikoAnimation) {
        if anim.patterns.is_empty() {
            return;
        }

        // 実行中の exclusive によるブロック判定
        if self.is_blocked_by_exclusive(scope_id, anim.id) {
            return;
        }

        let options = ParsedAnimationOptions::from_raw_options(&anim.options);

        // 新規アニメーションが exclusive の場合、既存のアニメーションを停止
        if options.is_exclusive
            && let Some(anims) = self.active_animations.get_mut(&scope_id)
        {
            for a in anims.iter_mut() {
                if let Some(ref targets) = options.exclusive_targets {
                    if targets.contains(&a.animation_id) {
                        a.is_finished = true;
                    }
                } else if a.animation_id != anim.id {
                    a.is_finished = true;
                }
            }
        }

        let mut active = ActiveAnimation::new(anim.id, base_surface_id, anim.patterns.clone())
            .with_options(&options);
        let (ox, oy) = self.get_animation_offset(scope_id, anim.id);
        active.offset_x = ox;
        active.offset_y = oy;
        if self.is_animation_paused(scope_id, anim.id) {
            active.is_paused = true;
        }

        let anims = self.active_animations.entry(scope_id).or_default();
        // 同一IDのアニメーションが既に再生中の場合は差し替えるか重複防止
        anims.retain(|a| a.animation_id != anim.id || a.is_finished);
        anims.push(active);
    }

    /// 指定サーフィスに定義されたアニメーションリストから、条件を満たすものを自動スケジュール
    pub fn schedule_surface_animations(
        &mut self,
        scope_id: u32,
        base_surface_id: i32,
        animations: &[SerikoAnimation],
        rng01: f64,
    ) {
        for anim in animations {
            if let Some(ref interval) = anim.interval {
                match interval {
                    Interval::Never => continue,
                    Interval::Bind => {
                        if !self.is_bind_active(scope_id, anim.id) {
                            continue;
                        }
                    }
                    Interval::RunOnce => {
                        self.start_animation(scope_id, base_surface_id, anim);
                        continue;
                    }
                    Interval::Always => {
                        self.start_animation(scope_id, base_surface_id, anim);
                        continue;
                    }
                    Interval::Sometimes
                    | Interval::Rarely
                    | Interval::Random(_)
                    | Interval::Periodic(_) => {
                        // 1秒あたりの発火判定
                        if interval.should_fire(1000, rng01) {
                            self.start_animation(scope_id, base_surface_id, anim);
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    /// 発話開始トリガー
    pub fn on_talk_start(&mut self, scope_id: u32, animations: &[SerikoAnimation]) {
        self.spoken_counts.insert(scope_id, 0);
        self.talking_flags.insert(scope_id, true);
        let base_surface = self.current_surface(scope_id);
        for anim in animations {
            if let Some(Interval::StartTalk) = anim.interval {
                self.start_animation(scope_id, base_surface, anim);
            }
        }
    }

    /// 1文字発話トリガー
    pub fn on_char_spoken(&mut self, scope_id: u32, animations: &[SerikoAnimation]) {
        if !self.talking_flags.get(&scope_id).copied().unwrap_or(false) {
            self.on_talk_start(scope_id, animations);
        }
        let count = self.spoken_counts.entry(scope_id).or_insert(0);
        *count = count.saturating_add(1);
        let current_count = *count;
        let base_surface = self.current_surface(scope_id);

        if !self.is_seriko_talk_enabled(scope_id) {
            return;
        }

        for anim in animations {
            if let Some(Interval::Talk) = anim.interval {
                self.start_animation(scope_id, base_surface, anim);
            }
            // talk,N パターン等の処理
            if let Some(Interval::Custom(ref s)) = anim.interval
                && s.starts_with("talk,")
            {
                let n: u32 = s.trim_start_matches("talk,").parse().unwrap_or(1);
                if n > 0 && current_count.is_multiple_of(n) {
                    self.start_animation(scope_id, base_surface, anim);
                }
            }
        }
    }

    /// 発話終了トリガー
    pub fn on_talk_end(&mut self, scope_id: u32, animations: &[SerikoAnimation]) {
        if self.talking_flags.get(&scope_id).copied().unwrap_or(false) {
            let base_surface = self.current_surface(scope_id);
            for anim in animations {
                if let Some(Interval::EndTalk) = anim.interval {
                    self.start_animation(scope_id, base_surface, anim);
                }
            }
        }
        self.talking_flags.insert(scope_id, false);
    }

    /// スクリプト終了 (\e, yen-e) トリガー
    pub fn on_script_end(&mut self, scope_id: u32, animations: &[SerikoAnimation]) {
        let base_surface = self.current_surface(scope_id);
        for anim in animations {
            if let Some(Interval::YenE) = anim.interval {
                self.start_animation(scope_id, base_surface, anim);
            }
        }
    }
}

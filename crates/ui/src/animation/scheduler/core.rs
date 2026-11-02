//! SERIKO アニメーションスケジューラ (Slot-08 外部インターフェース規約)

use crate::surfaces::{DrawMethod, Interval, SerikoAnimation};
use super::events::{FrameStepEvent, ParsedAnimationOptions};
use super::active::ActiveAnimation;
use std::collections::{HashMap, HashSet};

/// SERIKO アニメーションスケジューラ (Slot-08 外部インターフェース規約)
#[derive(Debug, Default, Clone)]
pub struct AnimationScheduler {
    /// scope_id -> active animations list
    active_animations: HashMap<u32, Vec<ActiveAnimation>>,
    /// scope_id -> paused animation IDs
    paused_animations: HashMap<u32, HashSet<u32>>,
    /// scope_id -> active bind IDs
    active_binds: HashMap<u32, HashSet<u32>>,
    /// scope_id -> current surface ID
    current_surfaces: HashMap<u32, i32>,
    /// 発話文字数カウンタ (scope_id -> count)
    spoken_counts: HashMap<u32, u32>,
    /// 発話中フラグ (scope_id -> bool)
    talking_flags: HashMap<u32, bool>,
    /// 動的アニメーション座標オフセット (scope_id -> (anim_id -> (offset_x, offset_y)))
    animation_offsets: HashMap<u32, HashMap<u32, (i32, i32)>>,
}

impl AnimationScheduler {
    pub fn new() -> Self {
        Self::default()
    }

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

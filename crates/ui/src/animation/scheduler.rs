//! SERIKO アニメーションスケジューラおよびフレーム更新イベント定義

use crate::surfaces::{AnimationPattern, Interval, SerikoAnimation};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// フレーム更新ステップイベント (Slot-08 外部インターフェース規約)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FrameStepEvent {
    /// キャラクターのスコープ (0=さくら, 1=うにゅ 等)
    pub scope_id: u32,
    /// ベースサーフィスID
    pub base_surface_id: i32,
    /// アニメーションID
    pub animation_id: u32,
    /// 適用するアニメーションパターン
    pub pattern: AnimationPattern,
    /// アニメーション開始からの累積経過時間（ミリ秒）
    pub elapsed_ms: u32,
    /// アニメーション全体の終了（-1 到達または最終パターン完了）
    pub is_finished: bool,
}

/// 実行中の単一アニメーションインスタンス状態
#[derive(Debug, Clone)]
pub struct ActiveAnimation {
    pub animation_id: u32,
    pub base_surface_id: i32,
    pub patterns: Vec<AnimationPattern>,
    pub current_pattern_index: usize,
    pub elapsed_ms: u32,
    pub next_step_at_ms: u32,
    pub is_paused: bool,
    pub is_finished: bool,
}

impl ActiveAnimation {
    pub fn new(animation_id: u32, base_surface_id: i32, patterns: Vec<AnimationPattern>) -> Self {
        let first_wait = patterns.first().map(|p| p.wait).unwrap_or(0);
        Self {
            animation_id,
            base_surface_id,
            patterns,
            current_pattern_index: 0,
            elapsed_ms: 0,
            next_step_at_ms: first_wait,
            is_paused: false,
            is_finished: false,
        }
    }

    /// 経過時間を進め、フレーム更新が発生した場合は `FrameStepEvent` を生成する
    pub fn advance(&mut self, delta_ms: u32, scope_id: u32) -> Option<FrameStepEvent> {
        if self.is_paused || self.is_finished || self.patterns.is_empty() {
            return None;
        }

        self.elapsed_ms = self.elapsed_ms.saturating_add(delta_ms);

        if self.elapsed_ms < self.next_step_at_ms {
            return None;
        }

        let pat = match self.patterns.get(self.current_pattern_index) {
            Some(p) => p.clone(),
            None => {
                self.is_finished = true;
                return None;
            }
        };

        // 次のステップのインデックスと待ち時間計算
        self.current_pattern_index += 1;
        let is_last = self.current_pattern_index >= self.patterns.len();
        let is_surface_minus_one = pat.surface == -1;

        if is_last || is_surface_minus_one {
            self.is_finished = true;
        } else if let Some(next_pat) = self.patterns.get(self.current_pattern_index) {
            self.next_step_at_ms = self.next_step_at_ms.saturating_add(next_pat.wait);
        }

        Some(FrameStepEvent {
            scope_id,
            base_surface_id: self.base_surface_id,
            animation_id: self.animation_id,
            pattern: pat,
            elapsed_ms: self.elapsed_ms,
            is_finished: self.is_finished,
        })
    }
}

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
}

impl AnimationScheduler {
    pub fn new() -> Self {
        Self::default()
    }

    /// 現在のサーフィスを設定し、既存のアニメーションをクリア
    pub fn set_surface(&mut self, scope_id: u32, surface_id: i32) {
        self.current_surfaces.insert(scope_id, surface_id);
        self.stop_animations(scope_id);
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

    /// アニメーションを手動またはトリガーによって開始登録する
    pub fn start_animation(&mut self, scope_id: u32, base_surface_id: i32, anim: &SerikoAnimation) {
        if anim.patterns.is_empty() {
            return;
        }

        let mut active = ActiveAnimation::new(anim.id, base_surface_id, anim.patterns.clone());
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
            if let Some(Interval::Custom(ref s)) = anim.interval {
                if s.starts_with("talk,") {
                    let n: u32 = s.trim_start_matches("talk,").parse().unwrap_or(1);
                    if n > 0 && current_count % n == 0 {
                        self.start_animation(scope_id, base_surface, anim);
                    }
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
        let mut events = Vec::new();

        for (&scope_id, anims) in self.active_animations.iter_mut() {
            let mut stop_others = false;

            for anim in anims.iter_mut() {
                if let Some(event) = anim.advance(delta_ms, scope_id) {
                    if event.pattern.surface == -2 {
                        // surface -2 はスコープ内の他のアニメーションを停止
                        stop_others = true;
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

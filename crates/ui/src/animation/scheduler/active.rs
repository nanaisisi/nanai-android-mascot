//! 実行中の単一アニメーションインスタンス状態

use crate::surfaces::AnimationPattern;
use super::events::{FrameStepEvent, ParsedAnimationOptions};
use std::collections::HashSet;

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
    pub is_background: bool,
    pub is_exclusive: bool,
    pub exclusive_targets: Option<HashSet<u32>>,
    pub is_shared_index: bool,
    pub offset_x: i32,
    pub offset_y: i32,
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
            is_background: false,
            is_exclusive: false,
            exclusive_targets: None,
            is_shared_index: false,
            offset_x: 0,
            offset_y: 0,
        }
    }

    pub fn with_options(mut self, options: &ParsedAnimationOptions) -> Self {
        self.is_background = options.is_background;
        self.is_exclusive = options.is_exclusive;
        self.exclusive_targets = options.exclusive_targets.clone();
        self.is_shared_index = options.is_shared_index;
        self
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
            is_background: self.is_background,
            offset_x: self.offset_x,
            offset_y: self.offset_y,
        })
    }
}

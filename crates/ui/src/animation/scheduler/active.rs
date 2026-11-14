//! 実行中の単一アニメーションインスタンス状態

use super::events::{FrameStepEvent, ParsedAnimationOptions};
use crate::surfaces_core_integration::AnimationPattern;
use std::collections::HashSet;

/// 実行中の単一アニメーションインスタンス状態
#[derive(Debug, Clone)]
pub struct ActiveAnimation {
    pub(crate) animation_id: u32,
    pub(crate) base_surface_id: i32,
    pub(crate) patterns: Vec<AnimationPattern>,
    pub(crate) current_pattern_index: usize,
    pub(crate) elapsed_ms: u32,
    pub(crate) next_step_at_ms: u32,
    pub(crate) is_paused: bool,
    pub(crate) is_finished: bool,
    pub(crate) is_background: bool,
    pub(crate) is_exclusive: bool,
    pub(crate) exclusive_targets: Option<HashSet<u32>>,
    pub(crate) is_shared_index: bool,
    pub(crate) offset_x: i32,
    pub(crate) offset_y: i32,
}

#[allow(dead_code)]
impl ActiveAnimation {
    // Add getter methods
    pub fn animation_id(&self) -> u32 {
        self.animation_id
    }
    pub fn base_surface_id(&self) -> i32 {
        self.base_surface_id
    }
    pub fn patterns(&self) -> &[AnimationPattern] {
        &self.patterns
    }
    pub fn current_pattern_index(&self) -> usize {
        self.current_pattern_index
    }
    pub fn elapsed_ms(&self) -> u32 {
        self.elapsed_ms
    }
    pub fn next_step_at_ms(&self) -> u32 {
        self.next_step_at_ms
    }
    pub fn is_paused(&self) -> bool {
        self.is_paused
    }
    pub fn is_finished(&self) -> bool {
        self.is_finished
    }
    pub fn is_background(&self) -> bool {
        self.is_background
    }
    pub fn is_exclusive(&self) -> bool {
        self.is_exclusive
    }
    pub fn exclusive_targets(&self) -> Option<&HashSet<u32>> {
        self.exclusive_targets.as_ref()
    }
    pub fn is_shared_index(&self) -> bool {
        self.is_shared_index
    }
    pub fn offset_x(&self) -> i32 {
        self.offset_x
    }
    pub fn offset_y(&self) -> i32 {
        self.offset_y
    }
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

        let pat = self.patterns[self.current_pattern_index].clone();

        // 次のステップのインデックスと待ち時間計算
        self.current_pattern_index += 1;
        let is_last = self.current_pattern_index >= self.patterns.len();
        let is_surface_minus_one = pat.surface == -1;

        if is_last || is_surface_minus_one {
            self.is_finished = true;
        } else {
            self.next_step_at_ms = self
                .next_step_at_ms
                .saturating_add(self.patterns[self.current_pattern_index].wait);
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

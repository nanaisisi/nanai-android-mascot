//! SERIKO アニメーション実行器モジュール

pub mod scheduler;
pub mod timeline;

#[cfg(test)]
mod tests;

pub use scheduler::{ActiveAnimation, AnimationScheduler, FrameStepEvent};
pub use timeline::{ScheduledFrame, Timeline, build_timeline, cycle_len_ms};

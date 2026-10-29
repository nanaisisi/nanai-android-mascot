//! SERIKO アニメーション実行器（ukadoc-spec / descript / shell-surfaces 準拠）

use crate::surfaces::{AnimationPattern, Interval};
use serde::{Deserialize, Serialize};

/// 時刻 `at_ms` に適用される1フレーム
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ScheduledFrame {
    pub pattern: AnimationPattern,
    /// 開始時刻（ミリ秒）。`pattern.wait` の累積値
    pub at_ms: u32,
}

/// pattern 列を実行スケジュールへ変換する（pattern index 列に累積待ち時間を計算）
pub fn build_timeline(patterns: &[AnimationPattern]) -> Vec<ScheduledFrame> {
    let mut sorted: Vec<&AnimationPattern> = patterns.iter().collect();
    sorted.sort_by_key(|p| p.index);
    let mut out = Vec::with_capacity(sorted.len());
    let mut elapsed = 0u32;
    for pattern in sorted {
        elapsed = elapsed.saturating_add(pattern.wait);
        out.push(ScheduledFrame {
            pattern: pattern.clone(),
            at_ms: elapsed,
        });
    }
    out
}

/// 1サイクルの長さ（最終フレーム適用時刻 + その wait）
pub fn cycle_len_ms(patterns: &[AnimationPattern]) -> u32 {
    let timeline = build_timeline(patterns);
    match timeline.last() {
        Some(last) => last.at_ms.saturating_add(last.pattern.wait),
        None => 0,
    }
}

/// 再生用タイムライン（pattern 列を元に frame_at クエリを提供する）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Timeline {
    frames: Vec<ScheduledFrame>,
    total_ms: u32,
}

impl Timeline {
    /// pattern 列からタイムラインを構築する
    pub fn new(patterns: &[AnimationPattern]) -> Self {
        let frames = build_timeline(patterns);
        let total_ms = frames
            .last()
            .map(|f| f.at_ms.saturating_add(f.pattern.wait))
            .unwrap_or(0);
        Self { frames, total_ms }
    }

    /// 登録済みフレームリスト
    pub fn frames(&self) -> &[ScheduledFrame] {
        &self.frames
    }

    /// 1周期の長さ（ミリ秒）
    pub fn total_ms(&self) -> u32 {
        self.total_ms
    }

    /// 指定時刻に表示すべきフレーム（`at_ms <= elapsed` の最後のもの）
    pub fn frame_at(&self, elapsed_ms: u32) -> Option<&ScheduledFrame> {
        self.frames.iter().rev().find(|f| f.at_ms <= elapsed_ms)
    }
}

impl Interval {
    /// 乱数周期系（sometimes / rarely / random,N）の1秒あたり発火確率
    pub fn fire_per_second(&self) -> Option<f64> {
        match self {
            Interval::Sometimes => Some(1.0 / 10.0),
            Interval::Rarely => Some(1.0 / 30.0),
            Interval::Random(n) => {
                if *n == 0 {
                    Some(1.0)
                } else {
                    Some(1.0 / f64::from(*n))
                }
            }
            _ => None,
        }
    }

    /// `periodic,N`（一定周期ミリ秒）の周期
    pub fn periodic_ms(&self) -> Option<u32> {
        match self {
            Interval::Periodic(n) => Some(*n),
            _ => None,
        }
    }

    /// イベント駆動（自動発火しない）種別か
    pub fn is_event_driven(&self) -> bool {
        matches!(
            self,
            Interval::Never
                | Interval::Bind
                | Interval::Talk
                | Interval::StartTalk
                | Interval::EndTalk
                | Interval::YenE
        )
    }

    /// 指定時刻 `elapsed_ms` まで待機した時点での発火判定
    pub fn should_fire(&self, elapsed_ms: u64, rng01: f64) -> bool {
        if self.is_event_driven() {
            return false;
        }
        if let Some(period) = self.periodic_ms() {
            return period > 0 && elapsed_ms >= u64::from(period);
        }
        if let Some(sec) = self.fire_per_second() {
            let p = sec * (elapsed_ms as f64 / 1000.0);
            return rng01 < p.clamp(0.0, 1.0);
        }
        true
    }
}

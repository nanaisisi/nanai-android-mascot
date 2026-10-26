//! SERIKO アニメーション実行器（ukadoc-spec / descript / shell-surfaces 準拠）
//!
//! `animation[N].pattern[K]` 列を実行スケジュール（発火時刻列）に変換し、
//! インターバル種別に応じた発火判定・周期再生を担う。
//! 描画（Canvas 合成）は呼び出し側で行う。
//!
//! 待ち時間の意味: pattern K の `wait` は「pattern K が発火するまで待つ時間」
//! であり、pattern K の適用時刻 = 直前までの wait の総和
//! （例: pattern0,base,6 / pattern1,base,-1,85 → 6 を 0ms で表示し、85ms 後にクリア）。

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
        // 1周期の長さ: 最終フレームの適用時刻 + その wait
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
    ///
    /// ukadoc 標準: sometimes 約10秒に1回 / rarely 約30秒に1回 / random,N 約N秒に1回
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
    ///
    /// - `always` / `runonce` / `periodic,N`: 周期到来で発火 (`elapsed >= n` 又は即時)
    /// - 乱数周期系: `rng01`（0.0-1.0 の乱数）が1秒あたり発火確率より小さければ発火
    /// - イベント駆動系: false（外部イベントで開始する）
    pub fn should_fire(&self, elapsed_ms: u64, rng01: f64) -> bool {
        if self.is_event_driven() {
            return false;
        }
        if let Some(period) = self.periodic_ms() {
            // periodic,N: 一定周期到来で発火
            return period > 0 && elapsed_ms >= u64::from(period);
        }
        if let Some(sec) = self.fire_per_second() {
            // 1秒あたりの確率へ圧縮（経過時間に対する連続近似）
            let p = sec * (elapsed_ms as f64 / 1000.0);
            return rng01 < p.clamp(0.0, 1.0);
        }
        // always / runonce は周期に応じて発火
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::surfaces::{DrawMethod, SurfacesTxt};

    fn pattern(index: u32, surface: i32, wait: u32) -> AnimationPattern {
        AnimationPattern {
            index,
            method: DrawMethod::Overlay,
            surface,
            wait,
            x: 0,
            y: 0,
            options: vec![],
        }
    }

    #[test]
    fn test_build_timeline() {
        // mock_nanai まばたき形式: 表示(0ms) → 85ms待ってクリア
        let patterns = vec![
            pattern(0, 6, 0),   // at 0? wait0=0 → 0
            pattern(1, -1, 85), // at 0 + 85 = 85
        ];
        let timeline = build_timeline(&patterns);
        assert_eq!(timeline[0].at_ms, 0);
        assert_eq!(timeline[1].at_ms, 85);

        // cycle: 最終適用 85 + wait 85 = 170ms でループ1周期
        assert_eq!(cycle_len_ms(&patterns), 170);

        // 乱序でも index 順に並ぶ
        let shuffled = vec![pattern(1, -1, 85), pattern(0, 6, 0)];
        let timeline = build_timeline(&shuffled);
        assert_eq!(timeline[0].pattern.surface, 6);
        assert_eq!(timeline[1].at_ms, 85);
    }

    #[test]
    fn test_frame_at() {
        let patterns = vec![pattern(0, 6, 0), pattern(1, -1, 85)];
        let tl = Timeline::new(&patterns);
        assert_eq!(tl.frame_at(0).unwrap().pattern.surface, 6);
        assert_eq!(tl.frame_at(84).unwrap().pattern.surface, 6);
        assert_eq!(tl.frame_at(85).unwrap().pattern.surface, -1);
        assert_eq!(tl.frame_at(10_000).unwrap().pattern.surface, -1);
        assert_eq!(tl.total_ms(), 170);

        // 空のタイムライン
        assert!(Timeline::new(&[]).frame_at(500).is_none());
        assert_eq!(Timeline::new(&[]).total_ms(), 0);
        assert_eq!(cycle_len_ms(&[]), 0);
    }

    #[test]
    fn test_multi_frame_timeline() {
        // 3コマの口パク: 0.0 → 150ms → 300ms 適用
        let patterns = vec![pattern(0, 9, 150), pattern(1, 10, 150), pattern(2, -1, 0)];
        let timeline = build_timeline(&patterns);
        assert_eq!(
            [timeline[0].at_ms, timeline[1].at_ms, timeline[2].at_ms],
            [150, 300, 300]
        );
        // cycle は最後の wait=0 + at=300
        assert_eq!(cycle_len_ms(&patterns), 300);
    }

    #[test]
    fn test_interval_firing() {
        // 乱数周期系
        assert_eq!(Interval::parse("random,5").fire_per_second(), Some(0.2));
        assert!((Interval::parse("sometimes").fire_per_second().unwrap() - 0.1).abs() < 1e-9);
        assert!((Interval::parse("rarely").fire_per_second().unwrap() - 1f64 / 30f64).abs() < 1e-9);

        // periodic
        assert_eq!(Interval::parse("periodic,1000").periodic_ms(), Some(1000));
        assert!(Interval::parse("periodic,1000").should_fire(1_000, 0.99));
        assert!(Interval::parse("periodic,1000").should_fire(10_000, 0.99));
        assert!(!Interval::parse("periodic,1000").should_fire(500, 0.99));

        // イベント駆動は自動発火しない
        for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {
            assert!(!Interval::parse(v).should_fire(100_000, 0.0), "{v}");
        }

        // runonce / always は発火する
        assert!(Interval::parse("runonce").should_fire(0, 0.0));
        assert!(Interval::parse("always").should_fire(0, 0.0));

        // random は確率内の乱数で発火・確率外では非発火
        let random5 = Interval::parse("random,5");
        assert!(random5.should_fire(5_000, 0.5), "5秒経過で確率は1.0");
        assert!(!random5.should_fire(1_000, 0.9), "1秒経過で確率は0.2");
        assert!(random5.should_fire(1_000, 0.1), "1秒経過・乱数0.1は発火");
    }

    #[test]
    fn test_mock_nanai_animation() {
        // 実シェルのまばたき周期タイムライン（存在時のみ）
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../assets/ghost/mock_nanai/shell/master/surfaces.txt");
        if !path.exists() {
            return;
        }
        let content = crate::vfs::open_text_file(&path).unwrap();
        let txt = SurfacesTxt::parse(&content);
        let def0 = txt.surface(0).unwrap();
        let anim0 = &def0.animations[&0];
        assert_eq!(anim0.interval, Some(Interval::Random(3)));
        let timeline = build_timeline(&anim0.patterns);
        assert_eq!(timeline[0].pattern.surface, 6);
        assert_eq!(timeline[0].at_ms, 0);
        assert_eq!(timeline[1].pattern.surface, -1);
        assert_eq!(timeline[1].at_ms, 85);
    }
}

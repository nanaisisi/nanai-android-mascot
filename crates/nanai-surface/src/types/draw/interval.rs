//! アニメーションインターバルの型

use serde::{Deserialize, Serialize};

pub(crate) fn parse_id_list_inner(s: &str) -> Vec<u32> {
    let trimmed = s.trim().trim_start_matches(',').trim();
    let trimmed = trimmed.trim_matches(|c| c == '(' || c == ')' || c == '[' || c == ']');
    trimmed
        .split([',', '.', ' ', '+'])
        .filter_map(|p| p.trim().parse::<u32>().ok())
        .collect()
}

/// `animation[N].interval` の種別（ukadoc: h-animationinterval 系）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Interval {
    /// `always`：常時ループ
    Always,
    /// `sometimes`：短い乱数周期で発火（約数秒に1回程度）
    Sometimes,
    /// `rarely`：まれに発火（より長い乱数周期）
    Rarely,
    /// `random,N`：約N秒に1回の割合で発火
    Random(u32),
    /// `periodic,N`：一定周期（Nミリ秒）ごとに発火
    Periodic(u32),
    /// `runonce`：サーフィス切替時に必ず1回だけ実行
    RunOnce,
    /// `never`：自動発火しない（SHIORI からの強制実行用）
    Never,
    /// `bind`：着せ替えパーツ装着時に発火
    Bind,
    /// `talk`：発話中ループ
    Talk,
    /// `starttalk`：発話開始時に1回
    StartTalk,
    /// `endtalk`：発話終了時に1回
    EndTalk,
    /// `\e`（yen-e）：さくらスクリプト `\e` 到達時に強制実行
    YenE,
    /// その他の拡張種別
    Custom(String),
}

impl Interval {
    /// `random,3` / `periodic,1000` のような値を解析する（大文字小文字は無視）
    pub fn parse(value: &str) -> Self {
        let v = value.trim();
        let lower = v.to_lowercase();
        let (head, param) = if let Some((h, p)) = lower.split_once(',') {
            (h.trim(), Some(p.trim().to_string()))
        } else {
            (lower.as_str(), None)
        };
        // 複合指定（+ 区切り、例: "bind+sometimes", "bind+random,5" 等）のサポート
        if head.contains('+') {
            let parts: Vec<&str> = head
                .split('+')
                .map(|s| s.trim())
                .filter(|s| !s.is_empty())
                .collect();
            // 優先順位: 周期/乱数系(random, periodic, sometimes, rarely, always) > イベント駆動系(bind, talk, etc.)
            for part in &parts {
                match *part {
                    "random" => {
                        return Self::Random(param.and_then(|p| p.parse().ok()).unwrap_or(10));
                    }
                    "periodic" => {
                        return Self::Periodic(param.and_then(|p| p.parse().ok()).unwrap_or(1000));
                    }
                    "sometimes" => return Self::Sometimes,
                    "rarely" => return Self::Rarely,
                    "always" => return Self::Always,
                    _ => {}
                }
            }
            if let Some(first) = parts.first() {
                match *first {
                    "bind" => return Self::Bind,
                    "talk" => return Self::Talk,
                    "starttalk" => return Self::StartTalk,
                    "endtalk" => return Self::EndTalk,
                    "runonce" => return Self::RunOnce,
                    "never" => return Self::Never,
                    "\\e" | "/e" => return Self::YenE,
                    other => return Self::Custom(other.to_string()),
                }
            }
        }

        match head {
            "always" => Self::Always,
            "sometimes" => Self::Sometimes,
            "rarely" => Self::Rarely,
            "never" => Self::Never,
            "runonce" => Self::RunOnce,
            "bind" => Self::Bind,
            "talk" => Self::Talk,
            "starttalk" => Self::StartTalk,
            "endtalk" => Self::EndTalk,
            "\\e" | "/e" => Self::YenE,
            "random" => Self::Random(param.and_then(|p| p.parse().ok()).unwrap_or(10)),
            "periodic" => Self::Periodic(param.and_then(|p| p.parse().ok()).unwrap_or(1000)),
            other => Self::Custom(other.to_string()),
        }
    }

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

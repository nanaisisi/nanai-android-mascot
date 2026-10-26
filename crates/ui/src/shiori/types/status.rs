//! `Status` ヘッダ（SSP拡張）の型

use serde::{Deserialize, Serialize};

/// ゴースト実行状態（`Status` ヘッダのトークン群）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum GhostStatusToken {
    Talking,
    Choosing,
    Minimizing,
    Induction,
    Passive,
    TimeCritical,
    NoUserBreak,
    Online,
    /// `opening(input / teach / dialog...)`
    Opening(String),
    /// `balloon(0=2 / 1=0)` の (キャラID, バルーンID) 列
    Balloon(Vec<(u32, u32)>),
    /// その他の拡張トークン
    Custom(String),
}

impl GhostStatusToken {
    /// Status ヘッダ値（カンマ区切り）をパースする
    pub fn parse_list(value: &str) -> Vec<Self> {
        let mut out = Vec::new();
        for token in value.trim().split(',') {
            let t = token.trim();
            if t.is_empty() {
                continue;
            }
            let lower = t.to_lowercase();
            if let Some(kind) = lower.strip_prefix("opening(") {
                out.push(Self::Opening(kind.trim_end_matches(')').to_string()));
            } else if let Some(ids) = lower.strip_prefix("balloon(") {
                let inner = ids.trim_end_matches(')').replace('/', ",0,");
                let pairs = inner
                    .split(',')
                    .filter(|s| !s.trim().is_empty())
                    .map(|s| match s.trim().split_once('=') {
                        Some((c, b)) => (
                            c.trim().parse::<u32>().unwrap_or(0),
                            b.trim().parse::<u32>().unwrap_or(0),
                        ),
                        None => (s.trim().parse::<u32>().unwrap_or(0), 0),
                    })
                    .collect();
                out.push(Self::Balloon(pairs));
            } else {
                out.push(match lower.as_str() {
                    "talking" => Self::Talking,
                    "choosing" => Self::Choosing,
                    "minimizing" => Self::Minimizing,
                    "induction" => Self::Induction,
                    "passive" => Self::Passive,
                    "timecritical" => Self::TimeCritical,
                    "nouserbreak" => Self::NoUserBreak,
                    "online" => Self::Online,
                    other => Self::Custom(other.to_string()),
                });
            }
        }
        out
    }

    /// Status ヘッダ値（カンマ区切り）を書き出す
    pub fn write_tokens(tokens: &[Self]) -> String {
        tokens
            .iter()
            .map(|t| match t {
                Self::Talking => "talking".into(),
                Self::Choosing => "choosing".into(),
                Self::Minimizing => "minimizing".into(),
                Self::Induction => "induction".into(),
                Self::Passive => "passive".into(),
                Self::TimeCritical => "timecritical".into(),
                Self::NoUserBreak => "nouserbreak".into(),
                Self::Online => "online".into(),
                Self::Opening(kind) => format!("opening({})", kind),
                Self::Balloon(pairs) => format!(
                    "balloon({})",
                    pairs
                        .iter()
                        .map(|(c, b)| format!("{}={}", c, b))
                        .collect::<Vec<_>>()
                        .join("/")
                ),
                Self::Custom(s) => s.clone(),
            })
            .collect::<Vec<_>>()
            .join(",")
    }
}

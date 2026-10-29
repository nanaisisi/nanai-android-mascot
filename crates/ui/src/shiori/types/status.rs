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
                let inner = ids.trim_end_matches(')').replace('/', ",");
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ghost_status_token_parsing_and_writing() {
        let raw = "talking, , choosing, minimizing, induction, passive, timecritical, nouserbreak, online, opening(input), balloon(0=2/1=1/3), custom_ext";
        let tokens = GhostStatusToken::parse_list(raw);
        assert_eq!(
            tokens,
            vec![
                GhostStatusToken::Talking,
                GhostStatusToken::Choosing,
                GhostStatusToken::Minimizing,
                GhostStatusToken::Induction,
                GhostStatusToken::Passive,
                GhostStatusToken::TimeCritical,
                GhostStatusToken::NoUserBreak,
                GhostStatusToken::Online,
                GhostStatusToken::Opening("input".to_string()),
                GhostStatusToken::Balloon(vec![(0, 2), (1, 1), (3, 0)]),
                GhostStatusToken::Custom("custom_ext".to_string()),
            ]
        );

        let written = GhostStatusToken::write_tokens(&tokens);
        assert!(written.contains("talking"));
        assert!(written.contains("choosing"));
        assert!(written.contains("minimizing"));
        assert!(written.contains("induction"));
        assert!(written.contains("passive"));
        assert!(written.contains("timecritical"));
        assert!(written.contains("nouserbreak"));
        assert!(written.contains("online"));
        assert!(written.contains("opening(input)"));
        assert!(written.contains("balloon(0=2/1=1/3=0)"));
        assert!(written.contains("custom_ext"));
    }

    #[test]
    fn test_balloon_status_single_token() {
        let tokens = GhostStatusToken::parse_list("balloon(2)");
        assert_eq!(tokens, vec![GhostStatusToken::Balloon(vec![(2, 0)])]);
    }
}

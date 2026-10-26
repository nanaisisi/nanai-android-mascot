//! SHIORI/3.0 プロトコルの型定義

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------- メソッド

/// リクエストメソッド（GET: 返値前提 / NOTIFY: 返値無視）
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum ShioriMethod {
    #[default]
    Get,
    Notify,
}

impl ShioriMethod {
    pub fn parse(value: &str) -> Self {
        if value.trim().eq_ignore_ascii_case("notify") {
            Self::Notify
        } else {
            Self::Get
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Get => "GET",
            Self::Notify => "NOTIFY",
        }
    }
}

// ---------------------------------------------------------------- SenderType

/// `SenderType` の属性トークン（SSP拡張、カンマ区切りで複数指定可）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SenderTypeTag {
    /// アプリケーション内部
    Internal,
    /// アプリケーション外部
    External,
    /// Sakura API
    SakuraApi,
    /// `\![embed]` タグ
    Embed,
    /// `\![raise]` タグ
    Raise,
    /// プロパティシステム参照
    Property,
    /// プラグイン
    Plugin,
    /// SSTP
    Sstp,
    /// コミュニケート
    Communicate,
    /// その他（拡張）
    Custom(String),
}

impl SenderTypeTag {
    pub fn parse(value: &str) -> Self {
        match value.trim().to_lowercase().as_str() {
            "internal" => Self::Internal,
            "external" => Self::External,
            "sakuraapi" => Self::SakuraApi,
            "embed" => Self::Embed,
            "raise" => Self::Raise,
            "property" => Self::Property,
            "plugin" => Self::Plugin,
            "sstp" => Self::Sstp,
            "communicate" => Self::Communicate,
            other => Self::Custom(other.to_string()),
        }
    }

    pub fn token(&self) -> String {
        match self {
            Self::Internal => "internal".into(),
            Self::External => "external".into(),
            Self::SakuraApi => "sakuraapi".into(),
            Self::Embed => "embed".into(),
            Self::Raise => "raise".into(),
            Self::Property => "property".into(),
            Self::Plugin => "plugin".into(),
            Self::Sstp => "sstp".into(),
            Self::Communicate => "communicate".into(),
            Self::Custom(s) => s.clone(),
        }
    }
}

/// カンマ区切りの SenderType 列
pub fn parse_sender_types(value: &str) -> Vec<SenderTypeTag> {
    value
        .split(',')
        .map(SenderTypeTag::parse)
        .filter(|t| !matches!(t, SenderTypeTag::Custom(v) if v.is_empty()))
        .collect()
}

// ---------------------------------------------------------------- SecurityLevel

/// セキュリティレベル（script / event 送信元の安全性）
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SecurityLevel {
    Local,
    External,
}

impl SecurityLevel {
    pub fn parse(value: &str) -> Option<Self> {
        match value.trim().to_lowercase().as_str() {
            "local" => Some(Self::Local),
            "external" => Some(Self::External),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Local => "local",
            Self::External => "external",
        }
    }
}

// ---------------------------------------------------------------- Status（SSP拡張）

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

// ---------------------------------------------------------------- ステータスコード

/// レスポンスステータスコード（ukadoc 収録分）
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum StatusCode {
    /// 200: 成功、Value あり
    #[default]
    Ok,
    /// 204: 成功、Value なし
    NoContent,
    /// 311 (OnTeach): 追加情報取得が必要（入力ボックス再オープン）
    NotEnough,
    /// 312 (OnTeach): 直近の Reference を破棄し再問合せ
    Advice,
    /// 400: リクエスト解釈不能
    BadRequest,
    /// 500: SHIORI 内部エラー
    InternalError,
    /// その他（互換実装の独自コード）
    Other(u16),
}

impl StatusCode {
    pub fn parse(code: u16) -> Self {
        match code {
            200 => Self::Ok,
            204 => Self::NoContent,
            311 => Self::NotEnough,
            312 => Self::Advice,
            400 => Self::BadRequest,
            500 => Self::InternalError,
            other => Self::Other(other),
        }
    }

    pub fn code(&self) -> u16 {
        match self {
            Self::Ok => 200,
            Self::NoContent => 204,
            Self::NotEnough => 311,
            Self::Advice => 312,
            Self::BadRequest => 400,
            Self::InternalError => 500,
            Self::Other(n) => *n,
        }
    }

    pub fn text(&self) -> &'static str {
        match self {
            Self::Ok => "OK",
            Self::NoContent => "No Content",
            Self::NotEnough => "Not Enough",
            Self::Advice => "Advice",
            Self::BadRequest => "Bad Request",
            Self::InternalError => "Internal Server Error",
            Self::Other(_) => "",
        }
    }
}

// ---------------------------------------------------------------- ErrorLevel（SSP拡張）

/// SHIORI 内部エラーの通知レベル（`\u{1}` 区切りで複数指定可）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorLevel {
    Info,
    Notice,
    Warning,
    Error,
    Critical,
    Custom(String),
}

impl ErrorLevel {
    /// `\u{1}` 区切りの ErrorLevel ヘッダ値をパースする
    pub fn parse_list(value: &str) -> Vec<Self> {
        value
            .split('\u{1}')
            .map(|s| match s.trim().to_lowercase().as_str() {
                "info" => Self::Info,
                "notice" => Self::Notice,
                "warning" => Self::Warning,
                "error" => Self::Error,
                "critical" => Self::Critical,
                other => Self::Custom(other.to_string()),
            })
            .collect()
    }

    /// `\u{1}` 区切りの ErrorLevel ヘッダ値を書き出す
    pub fn join_tokens(levels: &[Self]) -> String {
        levels
            .iter()
            .map(|l| match l {
                Self::Info => "info".into(),
                Self::Notice => "notice".into(),
                Self::Warning => "warning".into(),
                Self::Error => "error".into(),
                Self::Critical => "critical".into(),
                Self::Custom(s) => s.clone(),
            })
            .collect::<Vec<_>>()
            .join("\u{1}")
    }
}

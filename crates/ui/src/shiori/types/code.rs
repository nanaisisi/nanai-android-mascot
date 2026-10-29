//! レスポンスステータスコード・エラーレベルの型

use serde::{Deserialize, Serialize};

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

/// SHIORI 内部エラーの通知レベル（`\u{1}` 区切りで複数指定可、SSP拡張）
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_status_code_methods() {
        assert_eq!(StatusCode::parse(200), StatusCode::Ok);
        assert_eq!(StatusCode::Ok.code(), 200);
        assert_eq!(StatusCode::Ok.text(), "OK");

        assert_eq!(StatusCode::parse(204), StatusCode::NoContent);
        assert_eq!(StatusCode::NoContent.code(), 204);
        assert_eq!(StatusCode::NoContent.text(), "No Content");

        assert_eq!(StatusCode::parse(311), StatusCode::NotEnough);
        assert_eq!(StatusCode::NotEnough.code(), 311);
        assert_eq!(StatusCode::NotEnough.text(), "Not Enough");
        assert_eq!(StatusCode::parse(312), StatusCode::Advice);
        assert_eq!(StatusCode::Advice.code(), 312);
        assert_eq!(StatusCode::Advice.text(), "Advice");
        assert_eq!(StatusCode::parse(400), StatusCode::BadRequest);
        assert_eq!(StatusCode::BadRequest.code(), 400);
        assert_eq!(StatusCode::BadRequest.text(), "Bad Request");
        assert_eq!(StatusCode::parse(500), StatusCode::InternalError);
        assert_eq!(StatusCode::InternalError.code(), 500);
        assert_eq!(StatusCode::InternalError.text(), "Internal Server Error");
        assert_eq!(StatusCode::parse(999), StatusCode::Other(999));
        assert_eq!(StatusCode::Other(999).code(), 999);
        assert_eq!(StatusCode::Other(999).text(), "");
    }

    #[test]
    fn test_error_level_parsing_and_joining() {
        let raw = "info\u{1}warning\u{1}custom_lvl";
        let levels = ErrorLevel::parse_list(raw);
        assert_eq!(
            levels,
            vec![
                ErrorLevel::Info,
                ErrorLevel::Warning,
                ErrorLevel::Custom("custom_lvl".to_string()),
            ]
        );

        let joined = ErrorLevel::join_tokens(&levels);
        assert!(joined.contains("info"));
        assert!(joined.contains("warning"));
        assert!(joined.contains("custom_lvl"));
    }

    #[test]
    fn test_all_error_level_variants() {
        let raw = "notice\u{1}error\u{1}critical";
        let levels = ErrorLevel::parse_list(raw);
        assert_eq!(
            levels,
            vec![ErrorLevel::Notice, ErrorLevel::Error, ErrorLevel::Critical]
        );
        let joined = ErrorLevel::join_tokens(&levels);
        assert_eq!(joined, "notice\u{1}error\u{1}critical");
    }
}

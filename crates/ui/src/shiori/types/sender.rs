//! `SenderType` ヘッダの型（SSP拡張）

use serde::{Deserialize, Serialize};

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sender_type_parsing_and_token() {
        let raw = "internal, sakuraapi, sstp, custom_tag";
        let tags = parse_sender_types(raw);
        assert_eq!(
            tags,
            vec![
                SenderTypeTag::Internal,
                SenderTypeTag::SakuraApi,
                SenderTypeTag::Sstp,
                SenderTypeTag::Custom("custom_tag".to_string()),
            ]
        );

        assert_eq!(SenderTypeTag::Internal.token(), "internal");
        assert_eq!(SenderTypeTag::SakuraApi.token(), "sakuraapi");
        assert_eq!(SenderTypeTag::Custom("test".into()).token(), "test");
    }
}

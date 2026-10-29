//! リクエストメソッド・セキュリティレベルの型

use serde::{Deserialize, Serialize};

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shiori_method_and_security_level() {
        assert_eq!(ShioriMethod::parse("NOTIFY"), ShioriMethod::Notify);
        assert_eq!(ShioriMethod::parse("get"), ShioriMethod::Get);
        assert_eq!(ShioriMethod::Get.as_str(), "GET");
        assert_eq!(ShioriMethod::Notify.as_str(), "NOTIFY");

        assert_eq!(SecurityLevel::parse("local"), Some(SecurityLevel::Local));
        assert_eq!(SecurityLevel::parse("EXTERNAL"), Some(SecurityLevel::External));
        assert_eq!(SecurityLevel::parse("invalid"), None);
        assert_eq!(SecurityLevel::Local.as_str(), "local");
        assert_eq!(SecurityLevel::External.as_str(), "external");
    }
}

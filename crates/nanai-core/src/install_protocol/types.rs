//! UKADOC (SSP仕様) インストールプロトコルの定数および型定義

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(rename_all = "lowercase")]
pub enum InstallIdentifier {
    Ghost,
    Shell,
    Balloon,
    Plugin,
    Headline,
    Package,
    Supplement,
    #[serde(rename = "calendar.skin")]
    CalendarSkin,
    #[serde(rename = "calendar.plugin")]
    CalendarPlugin,
    Profile,
    Taromime,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(rename_all = "lowercase")]
pub enum InstallFailureReason {
    Unsupported,
    Extraction,
    #[serde(rename = "unlha32 error")]
    Unlha32Error,
    Artificial,
    #[serde(rename = "write error")]
    WriteError,
    #[serde(rename = "invalid path")]
    InvalidPath,
    #[serde(rename = "format error")]
    FormatError,
}

/// UKADOC仕様: インストールの識別子 (Install Identifiers)
pub const INSTALL_IDENTIFIERS: &[&str] = &[
    "ghost",
    "shell",
    "balloon",
    "plugin",
    "headline",
    "package",
    "supplement",
    "calendar.skin",
    "calendar.plugin",
    "profile",
    "taromime",
];

/// UKADOC仕様: インストールの失敗理由 (Install Reasons of Failure)
pub const INSTALL_FAILURE_REASONS: &[&str] = &[
    "unsupported",
    "extraction",
    "unlha32 error",
    "artificial",
    "write error",
    "invalid path",
    "format error",
];

/// 複数リソース一括インストール（複数リソース展開）判定モデル
#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct MultiResourceInstallResult {
    pub(crate) count: String,
    pub(crate) is_multi: bool,
}

impl MultiResourceInstallResult {
    pub fn count(&self) -> &str {
        &self.count
    }

    pub fn is_multi(&self) -> bool {
        self.is_multi
    }
}

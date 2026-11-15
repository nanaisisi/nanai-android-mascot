//! UKADOC (SSP仕様) ネットワーク更新プロトコルの定数およびデータ構造体定義

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;

/// UKADOC仕様: ネットワーク更新対象の種別 (Update Target Types)
pub const UPDATE_TARGET_TYPES: &[&str] = &["ghost", "shell", "balloon", "plugin", "headline"];

/// UKADOC仕様: ネットワーク更新理由 (Update Reasons / Modes)
pub const UPDATE_REASONS: &[&str] = &["manual", "auto", "script"];

/// UKADOC仕様: ネットワーク更新成功理由 (Update Complete Results)
pub const UPDATE_RESULT_COMPLETE: &[&str] = &["none", "changed"];

/// UKADOC仕様: ネットワーク失敗理由 (Update Result Failure Reasons)
pub const UPDATE_RESULT_FAILURE_REASONS: &[&str] = &[
    "timeout",
    "404",
    "md5 miss",
    "fileio",
    "artificial",
    "readonly",
];

/// UKADOC仕様: ネットワーク更新イベントの発生順序 (Update Event Order)
pub const UPDATE_EVENT_ORDER: &[&str] = &[
    "OnUpdateProcessExec",
    "OnUpdateBegin",
    "OnUpdateReady",
    "OnUpdate.OnDownloadBegin",
    "OnUpdate.OnMD5CompareBegin",
    "OnUpdate.OnMD5CompareComplete",
    "OnUpdateComplete",
];

/// ネットワーク更新進捗計算結果
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct UpdateProgressResult {
    pub percent: u32,
    pub is_complete: bool,
}

/// delete.txt のパース結果（削除対象ファイルパターン一覧）
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct DeleteTxtManifest {
    pub patterns: Vec<String>,
}

/// developer_options.txt のパース結果（開発者オプション・除外設定）
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct DeveloperOptionsManifest {
    pub noupdate_patterns: Vec<String>,
    pub properties: BTreeMap<String, String>,
}

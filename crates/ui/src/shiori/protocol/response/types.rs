//! SHIORI/3.0 レスポンス構造体およびアクセサメソッド

use super::super::super::types::*;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// SHIORI/3.0 レスポンス
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ShioriResponse {
    pub status: StatusCode,
    pub charset: String,
    /// `Sender:`（通常は SHIORI 実装名）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sender: Option<String>,
    /// `Value:`（喋りたい さくらスクリプト・複数行は \n 連結）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    /// `ValueNotify:`（SSP拡張・NOTIFY でも即時実行される実験的機能）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value_notify: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub security_level: Option<SecurityLevel>,
    /// バルーンマーカー表示文字列（SSP拡張）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub marker: Option<String>,
    /// `\u{1}` 区切り複数（ErrorDescription と要素数一致が規格要求）
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub error_level: Vec<ErrorLevel>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub error_description: Vec<String>,
    /// バルーンオフセット（X, Y）（SSP拡張）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub balloon_offset: Option<(i32, i32)>,
    /// Reference0（コミュニケート送り先 = ゴースト\0側の名前）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reference0: Option<String>,
    /// Reference1..N（互換性のため Reference1 = 通信先 OnCommunicate の Reference2）
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub references: Vec<String>,
    /// コミュニケート世代数（SSP拡張・SHIORI/2.x 互換）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub age: Option<u32>,
    /// 相手側に表示するバルーンマーカー（SSTP Marker として送信される）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub marker_send: Option<String>,
    /// `X-SSTP-PassThru-(後続)` → 値（複数指定可能）
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub passthru: BTreeMap<String, String>,
}

impl ShioriResponse {
    /// 204 No Content 形式の固定レスポンス
    pub fn no_content() -> Self {
        Self {
            status: StatusCode::NoContent,
            charset: "UTF-8".into(),
            ..Default::default()
        }
    }

    /// 200 OK（Value あり）レスポンス
    pub fn ok(value: &str) -> Self {
        Self {
            status: StatusCode::Ok,
            charset: "UTF-8".into(),
            value: Some(value.to_string()),
            ..Default::default()
        }
    }

    pub fn with_charset(mut self, charset: impl Into<String>) -> Self {
        self.charset = charset.into();
        self
    }

    pub(crate) fn push_continuation(&mut self, mode: Option<&str>, line: &str) {
        match mode {
            Some("value") => {
                if let Some(v) = self.value.take() {
                    self.value = Some(format!("{}\n{}", v, line));
                }
            }
            Some("value_notify") => {
                if let Some(v) = self.value_notify.take() {
                    self.value_notify = Some(format!("{}\n{}", v, line));
                }
            }
            _ => {}
        }
    }

    /// OnTeach の追加情報要求（311 Not Enough / 312 Advice）か
    pub fn is_teach_pending(&self) -> bool {
        matches!(self.status, StatusCode::NotEnough | StatusCode::Advice)
    }

    // --- Getter Methods ---

    pub fn status(&self) -> StatusCode {
        self.status
    }

    pub fn charset(&self) -> &str {
        &self.charset
    }

    pub fn sender(&self) -> Option<&str> {
        self.sender.as_deref()
    }

    pub fn value(&self) -> Option<&str> {
        self.value.as_deref()
    }

    pub fn value_notify(&self) -> Option<&str> {
        self.value_notify.as_deref()
    }

    pub fn security_level(&self) -> Option<SecurityLevel> {
        self.security_level
    }

    pub fn marker(&self) -> Option<&str> {
        self.marker.as_deref()
    }

    pub fn error_level(&self) -> &[ErrorLevel] {
        &self.error_level
    }

    pub fn error_description(&self) -> &[String] {
        &self.error_description
    }

    pub fn balloon_offset(&self) -> Option<(i32, i32)> {
        self.balloon_offset
    }

    pub fn reference0(&self) -> Option<&str> {
        self.reference0.as_deref()
    }

    pub fn references(&self) -> &[String] {
        &self.references
    }

    pub fn age(&self) -> Option<u32> {
        self.age
    }

    pub fn marker_send(&self) -> Option<&str> {
        self.marker_send.as_deref()
    }

    pub fn passthru(&self) -> &BTreeMap<String, String> {
        &self.passthru
    }
}

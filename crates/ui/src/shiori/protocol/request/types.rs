//! SHIORI/3.0 リクエスト型定義

use crate::shiori::types::*;

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// SHIORI/3.0 リクエスト
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ShioriRequest {
    pub(crate) method: ShioriMethod,
    pub(crate) charset: String,
    pub(crate) sender: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub(crate) sender_type: Vec<SenderTypeTag>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) security_level: Option<SecurityLevel>,
    /// `SecurityOrigin: null`（情報なし）とヘッダ省略を区別するため `Some(None)` で表現
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) security_origin: Option<Option<String>>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub(crate) status: Vec<GhostStatusToken>,
    pub(crate) id: String,
    /// 互換可能な基本イベント名（SSP拡張。`OnFirstBoot` → `OnBoot` など）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) base_id: Option<String>,
    /// Reference0..N
    pub(crate) references: Vec<String>,
    /// `X-SSTP-PassThru-(後続)` → 値
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub(crate) passthru: BTreeMap<String, String>,
}

impl ShioriRequest {
    pub fn with_sender(mut self, sender: impl Into<String>) -> Self {
        self.sender = sender.into();
        self
    }

    pub fn with_charset(mut self, charset: impl Into<String>) -> Self {
        self.charset = charset.into();
        self
    }

    pub fn with_method(mut self, method: ShioriMethod) -> Self {
        self.method = method;
        self
    }

    pub fn with_id(mut self, id: impl Into<String>) -> Self {
        self.id = id.into();
        self
    }

    pub fn with_reference(mut self, index: usize, value: impl Into<String>) -> Self {
        if self.references.len() <= index {
            self.references.resize(index + 1, String::new());
        }
        self.references[index] = value.into();
        self
    }

    /// GET（返値前提）リクエストを作る
    pub fn get(id: &str, references: &[String]) -> Self {
        Self {
            method: ShioriMethod::Get,
            charset: "UTF-8".into(),
            sender: "NanaiAndroidMascot".into(),
            id: id.to_string(),
            references: references.to_vec(),
            ..Default::default()
        }
    }

    /// UKADOC `capability` Notify イベント用リクエストを構築
    ///
    /// SHIORI/3.0 拡張ヘッダの対応状況 (request.* / response.*) を Reference* として列挙
    pub fn capability(references: &[String]) -> Self {
        Self::notify("capability", references)
    }

    /// NOTIFY（返値無視）リクエストを作る
    pub fn notify(id: &str, references: &[String]) -> Self {
        let mut req = Self::get(id, references);
        req.method = ShioriMethod::Notify;
        req
    }

    // --- Getter Methods ---

    pub fn method(&self) -> ShioriMethod {
        self.method
    }

    pub fn charset(&self) -> &str {
        &self.charset
    }

    pub fn sender(&self) -> &str {
        &self.sender
    }

    pub fn sender_type(&self) -> &[SenderTypeTag] {
        &self.sender_type
    }

    pub fn security_level(&self) -> Option<SecurityLevel> {
        self.security_level
    }

    pub fn security_origin(&self) -> Option<Option<&str>> {
        self.security_origin.as_ref().map(|o| o.as_deref())
    }

    pub fn status(&self) -> &[GhostStatusToken] {
        &self.status
    }

    pub fn id(&self) -> &str {
        &self.id
    }

    pub fn base_id(&self) -> Option<&str> {
        self.base_id.as_deref()
    }

    pub fn references(&self) -> &[String] {
        &self.references
    }

    pub fn passthru(&self) -> &BTreeMap<String, String> {
        &self.passthru
    }
}

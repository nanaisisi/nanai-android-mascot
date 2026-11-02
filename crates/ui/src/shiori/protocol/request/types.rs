//! SHIORI/3.0 リクエスト型定義

use crate::shiori::types::*;

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// SHIORI/3.0 リクエスト
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ShioriRequest {
    pub method: ShioriMethod,
    pub charset: String,
    pub sender: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub sender_type: Vec<SenderTypeTag>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub security_level: Option<SecurityLevel>,
    /// `SecurityOrigin: null`（情報なし）とヘッダ省略を区別するため `Some(None)` で表現
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub security_origin: Option<Option<String>>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub status: Vec<GhostStatusToken>,
    pub id: String,
    /// 互換可能な基本イベント名（SSP拡張。`OnFirstBoot` → `OnBoot` など）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub base_id: Option<String>,
    /// Reference0..N
    pub references: Vec<String>,
    /// `X-SSTP-PassThru-(後続)` → 値
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub passthru: BTreeMap<String, String>,
}

impl ShioriRequest {
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
}

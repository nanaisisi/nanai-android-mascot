//! SHIORI/3.0 リクエスト構造体および拡張パラメータ定義

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ShioriRequest {
    pub method: String,  // GET または NOTIFY
    pub version: String, // SHIORI/3.0
    pub headers: BTreeMap<String, String>,
}

/// UKADOC SHIORI/3.0 仕様に準拠した拡張リクエストパラメータ
#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
pub struct ShioriExtendedParams {
    pub charset: Option<String>,
    pub sender: Option<String>,
    pub sender_type: Option<String>,
    pub security_level: Option<String>,
    pub status: Option<String>,
    pub base_id: Option<String>,
}

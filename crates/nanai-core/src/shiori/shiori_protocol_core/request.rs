//! SHIORI/3.0 リクエスト構造体および拡張パラメータ定義

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ShioriRequest {
    pub(crate) method: String,  // GET または NOTIFY
    pub(crate) version: String, // SHIORI/3.0
    pub(crate) headers: BTreeMap<String, String>,
}

impl ShioriRequest {
    pub fn method(&self) -> &str {
        &self.method
    }

    pub fn version(&self) -> &str {
        &self.version
    }

    pub fn headers(&self) -> &BTreeMap<String, String> {
        &self.headers
    }
}

/// UKADOC SHIORI/3.0 仕様に準拠した拡張リクエストパラメータ
#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
pub struct ShioriExtendedParams {
    pub(crate) charset: Option<String>,
    pub(crate) sender: Option<String>,
    pub(crate) sender_type: Option<String>,
    pub(crate) security_level: Option<String>,
    pub(crate) status: Option<String>,
    pub(crate) base_id: Option<String>,
}

impl ShioriExtendedParams {
    pub fn charset(&self) -> Option<&str> {
        self.charset.as_deref()
    }

    pub fn sender(&self) -> Option<&str> {
        self.sender.as_deref()
    }

    pub fn sender_type(&self) -> Option<&str> {
        self.sender_type.as_deref()
    }

    pub fn security_level(&self) -> Option<&str> {
        self.security_level.as_deref()
    }

    pub fn status(&self) -> Option<&str> {
        self.status.as_deref()
    }

    pub fn base_id(&self) -> Option<&str> {
        self.base_id.as_deref()
    }
}

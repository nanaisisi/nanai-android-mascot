//! descript.txt 構造体およびパース処理モジュール

pub mod helpers;
pub mod queries;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub(crate) use helpers::expand_ids;

/// `descript.txt` のパース結果を保持する構造体
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Descript {
    pub properties: HashMap<String, String>,
}

impl Descript {
    /// テキスト内容から `descript.txt` をパース
    pub fn parse(content: &str) -> Self {
        let mut properties = HashMap::new();
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with("//") {
                continue;
            }
            if let Some((k, v)) = trimmed.split_once(',') {
                properties.insert(k.trim().to_lowercase(), v.trim().to_string());
            }
        }
        Self { properties }
    }

    /// キーに対応する値を取得（大文字小文字無視）
    pub fn get(&self, key: &str) -> Option<&String> {
        self.properties.get(&key.to_lowercase())
    }
}

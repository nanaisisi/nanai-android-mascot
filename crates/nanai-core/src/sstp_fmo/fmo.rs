//! FMO (Free Movement Object) パーサー

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct FmoEntry {
    pub(crate) name: String,
    pub(crate) ghost_name: String,
    pub(crate) hwnd: String,
    pub(crate) properties: BTreeMap<String, String>,
}

impl FmoEntry {
    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn ghost_name(&self) -> &str {
        &self.ghost_name
    }

    pub fn hwnd(&self) -> &str {
        &self.hwnd
    }

    pub fn properties(&self) -> &BTreeMap<String, String> {
        &self.properties
    }
}

/// FMO プロトコルデータ文字列をパース
pub fn parse_fmo_string(raw_fmo: &str) -> BTreeMap<String, FmoEntry> {
    let mut entries: BTreeMap<String, FmoEntry> = BTreeMap::new();

    for line in raw_fmo.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        if let Some((key_path, val)) = line.split_once('\u{0001}') {
            let parts: Vec<&str> = key_path.split('.').collect();
            if parts.len() >= 2 {
                let id = parts[0].to_string();
                let prop_name = parts[1].to_string();

                let entry = entries.entry(id.clone()).or_insert_with(|| FmoEntry {
                    name: id.clone(),
                    ghost_name: String::new(),
                    hwnd: String::new(),
                    properties: BTreeMap::new(),
                });

                if prop_name == "name" || prop_name == "ghostname" {
                    entry.ghost_name = val.to_string();
                } else if prop_name == "hwnd" {
                    entry.hwnd = val.to_string();
                }
                entry.properties.insert(prop_name, val.to_string());
            }
        }
    }

    entries
}

#[wasm_bindgen]
pub fn wasm_parse_fmo_string(raw_fmo: &str) -> Result<JsValue, JsValue> {
    let entries = parse_fmo_string(raw_fmo);
    Ok(serde_wasm_bindgen::to_value(&entries)?)
}

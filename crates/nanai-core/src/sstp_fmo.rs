//! SSTP (Sakura Script Transfer Protocol) & FMO (Free Movement Object) パーサー

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SstpRequest {
    pub command: String, // NOTIFY, EXECUTE, SEND, GIVE
    pub version: String, // SSTP/1.4, SSTP/1.1 等
    pub headers: BTreeMap<String, String>,
}

/// SSTP プロトコル文字列をパース
pub fn parse_sstp_request(raw_request: &str) -> Option<SstpRequest> {
    let mut lines = raw_request.lines();
    let first_line = lines.next()?.trim();

    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() < 2 {
        return None;
    }

    let command = parts[0].to_uppercase();
    let version = parts[1].to_string();

    let mut headers = BTreeMap::new();
    for line in lines {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Some((key, val)) = line.split_once(':') {
            headers.insert(key.trim().to_string(), val.trim().to_string());
        }
    }

    Some(SstpRequest {
        command,
        version,
        headers,
    })
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FmoEntry {
    pub name: String,
    pub ghost_name: String,
    pub hwnd: String,
    pub properties: BTreeMap<String, String>,
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_sstp_request() {
        let raw =
            "NOTIFY SSTP/1.1\r\nSender: TestSender\r\nEvent: OnTest\r\nOption: nobreak\r\n\r\n";
        let req = parse_sstp_request(raw).unwrap();

        assert_eq!(req.command, "NOTIFY");
        assert_eq!(req.version, "SSTP/1.1");
        assert_eq!(req.headers.get("Sender").unwrap(), "TestSender");
        assert_eq!(req.headers.get("Event").unwrap(), "OnTest");
    }

    #[test]
    fn test_parse_fmo_string() {
        let raw = "s0.name\u{0001}Emily\ns0.hwnd\u{0001}12345\n";
        let entries = parse_fmo_string(raw);

        assert_eq!(entries.get("s0").unwrap().ghost_name, "Emily");
        assert_eq!(entries.get("s0").unwrap().hwnd, "12345");
    }
}

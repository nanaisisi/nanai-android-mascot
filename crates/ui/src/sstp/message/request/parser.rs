use crate::sstp::types::SstpMethod;
use std::collections::HashMap;
use super::core::SstpRequest;
use super::types::IfGhostEntry;

impl SstpRequest {
    /// 生テキストから SSTP リクエストをパースする
    pub fn parse(raw: &str) -> Result<Self, String> {
        Self::parse_internal(raw, false)
    }

    /// DirectSSTP 生テキスト（WM_COPYDATA経由）をパースする
    pub fn parse_direct(raw: &str) -> Result<Self, String> {
        Self::parse_internal(raw, true)
    }

    fn parse_internal(raw: &str, is_direct: bool) -> Result<Self, String> {
        let mut lines = raw.lines();
        let first_line = lines.next().ok_or("Empty SSTP request")?.trim();
        if first_line.is_empty() {
            return Err("Empty SSTP request header line".to_string());
        }

        let parts: Vec<&str> = first_line.split_whitespace().collect();
        if parts.len() < 2 {
            return Err(format!("Invalid SSTP request line: {}", first_line));
        }

        // SAORI over DirectSSTP: "EXECUTE SAORI/1.0" or "GET Version SAORI/1.0"
        let method_str = parts[0];
        let method = SstpMethod::parse(method_str)
            .ok_or_else(|| format!("Unsupported SSTP method: {}", method_str))?;
        let version = parts[1].to_string();

        let mut charset = None;
        let mut sender = String::new();
        let mut default_script = None;
        let mut event = None;
        let mut sentence = None;
        let mut command = None;
        let mut hwnd = None;
        let mut receiver_ghost_hwnd = None;
        let mut receiver_ghost_name = None;
        let mut security_level = None;
        let mut id = None;
        let mut security_origin = None;
        let mut options = Vec::new();
        let mut entry = None;
        let mut if_ghosts = Vec::new();
        let mut current_if_ghost: Option<String> = None;
        let mut references = HashMap::new();
        let mut pass_thru = HashMap::new();
        let mut keep_alive = false;
        let mut surface = None;
        let mut document = None;
        let mut song = None;
        let mut ghost = None;
        let mut module = None;

        for line in lines {
            let line = line.trim();
            if line.is_empty() {
                break;
            }
            if let Some((k, v)) = line.split_once(':') {
                let key = k.trim();
                let val = v.trim().to_string();
                let key_lower = key.to_lowercase();

                if key_lower == "id" {
                    id = Some(val);
                } else if key_lower == "charset" {
                    charset = Some(val);
                } else if key_lower == "sender" {
                    sender = val;
                } else if key_lower == "script" {
                    if let Some(target) = current_if_ghost.take() {
                        if_ghosts.push(IfGhostEntry {
                            target,
                            script: val,
                        });
                    } else if default_script.is_none() {
                        default_script = Some(val);
                    }
                } else if key_lower == "ifghost" {
                    current_if_ghost = Some(val);
                } else if key_lower == "event" {
                    event = Some(val);
                } else if key_lower == "sentence" {
                    sentence = Some(val);
                } else if key_lower.starts_with("command") {
                    // Command or Command[param1,param2...]
                    command = Some(val);
                } else if key_lower == "hwnd" {
                    hwnd = val.parse().ok();
                } else if key_lower == "receiverghosthwnd" {
                    receiver_ghost_hwnd = val.parse().ok();
                } else if key_lower == "receiverghostname" {
                    receiver_ghost_name = Some(val);
                } else if key_lower == "securitylevel" {
                    security_level = Some(val);
                } else if key_lower == "securityorigin" {
                    security_origin = Some(val);
                } else if key_lower == "option" {
                    for opt in val.split(',') {
                        let opt_trim = opt.trim();
                        if !opt_trim.is_empty() {
                            options.push(opt_trim.to_string());
                        }
                    }
                } else if key_lower == "entry" {
                    entry = Some(val);
                } else if key_lower == "keepalive" {
                    keep_alive = val.to_lowercase() == "true" || val == "1";
                } else if key_lower == "surface" {
                    surface = Some(val);
                } else if key_lower == "document" {
                    document = Some(val);
                } else if key_lower == "song" {
                    song = Some(val);
                } else if key_lower == "ghost" {
                    ghost = Some(val);
                } else if key_lower == "module" {
                    module = Some(val);
                } else if key_lower.starts_with("reference") || key_lower.starts_with("argument") {
                    // Argument0 -> Reference0 正規化
                    let norm_key = if key_lower.starts_with("argument") {
                        format!("Reference{}", &key[8..])
                    } else {
                        key.to_string()
                    };
                    references.insert(norm_key, val);
                } else if key_lower.starts_with("x-sstp-passthru-") {
                    pass_thru.insert(key.to_string(), val);
                }
            }
        }

        if sender.is_empty() {
            sender = "Unknown".to_string();
        }

        // DirectSSTP または Owned SSTP (ID指定) の場合 SecurityLevel は Local
        if is_direct || id.is_some() {
            security_level = Some("local".to_string());
        }

        Ok(Self {
            method,
            version,
            charset,
            sender,
            script: default_script,
            event,
            sentence,
            command,
            hwnd,
            receiver_ghost_hwnd,
            receiver_ghost_name,
            security_level,
            security_origin,
            id,
            options,
            entry,
            if_ghosts,
            references,
            pass_thru,
            keep_alive,
            surface,
            document,
            song,
            ghost,
            module,
            is_direct,
        })
    }
}

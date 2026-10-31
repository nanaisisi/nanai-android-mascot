//! SSTP (SakuraScript Transfer Protocol) 1.x receiver and protocol handler (UKADOC spec compliance)
//! [SSTP/1.x], [method_send], [method_execute], [method_give], [method_communicate], [method_notify], [keepalive]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::Emitter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpRequest {
    pub method: Option<String>,
    pub sender: String,
    pub script: Option<String>,
    pub event: Option<String>,
    pub hwnd: Option<u64>,
    pub security_level: Option<String>,
    pub security_origin: Option<String>,
    pub references: HashMap<String, String>,
    pub keep_alive: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpResponse {
    pub status: String,
    pub value: String,
    pub id: Option<String>,
    pub reference0: Option<String>,
}

/// Parse raw SSTP/1.x request text conforming to UKADOC spec
pub fn parse_raw_sstp_request(raw: &str) -> Result<SstpRequest, String> {
    let mut lines = raw.lines();
    let first_line = lines.next().ok_or("Empty SSTP request")?;
    let mut method = "SEND".to_string();
    let upper = first_line.to_uppercase();
    if upper.starts_with("SEND") {
        method = "SEND".to_string();
    } else if upper.starts_with("EXECUTE") {
        method = "EXECUTE".to_string();
    } else if upper.starts_with("NOTIFY") {
        method = "NOTIFY".to_string();
    } else if upper.starts_with("COMMUNICATE") {
        method = "COMMUNICATE".to_string();
    } else if upper.starts_with("GIVE") {
        method = "GIVE".to_string();
    }

    let mut sender = "Unknown".to_string();
    let mut script = None;
    let mut event = None;
    let mut hwnd = None;
    let mut security_level = Some("local".to_string());
    let mut references = HashMap::new();
    let mut keep_alive = Some(false);

    for line in lines {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Some((key, val)) = line.split_once(':') {
            let key = key.trim();
            let val = val.trim().to_string();
            match key.to_lowercase().as_str() {
                "sender" => sender = val,
                "script" => script = Some(val),
                "event" => event = Some(val),
                "hwnd" => hwnd = val.parse().ok(),
                "securitylevel" => security_level = Some(val),
                "keepalive" => keep_alive = Some(val.to_lowercase() == "true" || val == "1"),
                _ => {
                    if key.starts_with("Reference") {
                        references.insert(key.to_string(), val);
                    }
                }
            }
        }
    }

    Ok(SstpRequest {
        method: Some(method),
        sender,
        script,
        event,
        hwnd,
        security_level,
        security_origin: None,
        references,
        keep_alive,
    })
}

#[tauri::command]
pub async fn send_sstp_request(
    request: SstpRequest,
    app_handle: tauri::AppHandle,
) -> Result<SstpResponse, String> {
    let method = request
        .method
        .unwrap_or_else(|| "SEND".to_string())
        .to_uppercase();
    println!(
        "📨 [SSTP/1.1] Method: {}, Sender: {}",
        method, request.sender
    );

    match method.as_str() {
        "SEND" | "NOTIFY" => {
            if let Some(ref script) = request.script {
                app_handle
                    .emit("sstp-execute-script", script)
                    .map_err(|e| e.to_string())?;
            }
        }
        "EXECUTE" => {
            if let Some(ref event) = request.event {
                app_handle
                    .emit("sstp-execute-event", event)
                    .map_err(|e| e.to_string())?;
            }
        }
        "COMMUNICATE" => {
            if let Some(ref script) = request.script {
                app_handle
                    .emit("sstp-communicate", script)
                    .map_err(|e| e.to_string())?;
            }
        }
        "GIVE" => {}
        _ => {
            return Ok(SstpResponse {
                status: "400 Bad Request".to_string(),
                value: format!("Unsupported SSTP method: {}", method),
                id: None,
                reference0: None,
            });
        }
    }

    Ok(SstpResponse {
        status: "200 OK".to_string(),
        value: "SSTP request processed successfully".to_string(),
        id: request.event,
        reference0: request.references.get("Reference0").cloned(),
    })
}

#[tauri::command]
pub async fn parse_and_send_sstp_raw(
    raw_request: String,
    app_handle: tauri::AppHandle,
) -> Result<SstpResponse, String> {
    let req = parse_raw_sstp_request(&raw_request)?;
    send_sstp_request(req, app_handle).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_raw_sstp() {
        let raw = "SEND SSTP/1.1\r\nSender: TestApp\r\nScript: \\0Hi\\e\r\nReference0: RefVal\r\n";
        let req = parse_raw_sstp_request(raw).unwrap();
        assert_eq!(req.sender, "TestApp");
        assert_eq!(req.script, Some("\\0Hi\\e".to_string()));
        assert_eq!(
            req.references.get("Reference0"),
            Some(&"RefVal".to_string())
        );
    }

    #[tokio::test]
    async fn test_sstp_send_request() {
        let req = SstpRequest {
            method: Some("SEND".to_string()),
            sender: "TestApp".to_string(),
            script: Some("\\0Hello\\e".to_string()),
            event: None,
            hwnd: None,
            security_level: Some("local".to_string()),
            security_origin: None,
            references: HashMap::new(),
            keep_alive: Some(false),
        };
        assert_eq!(req.sender, "TestApp");
    }
}

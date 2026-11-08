//! SSTP リクエスト受信用・処理実行モジュール

use crate::sstp::parser::parse_raw_sstp_request;
use crate::sstp::types::{SstpRequest, SstpResponse};
use nanai_android_mascot_ui::sstp::{
    SstpGhostConfig, SstpGhostContext, handle_execute_command,
};
use std::collections::HashMap;
use tauri::Emitter;

#[tauri::command]
pub async fn send_sstp_request(
    request: SstpRequest,
    app_handle: tauri::AppHandle,
) -> Result<SstpResponse, String> {
    send_sstp_request_with_config(request, &SstpGhostConfig::default(), app_handle).await
}

/// Send SSTP request with ghost configuration validation ([sstp.allowcommunicate], [sstp.allowunspecifiedsend])
pub async fn send_sstp_request_with_config(
    request: SstpRequest,
    config: &SstpGhostConfig,
    app_handle: tauri::AppHandle,
) -> Result<SstpResponse, String> {
    let method = request.method.as_deref().unwrap_or("SEND").to_uppercase();
    println!(
        "📨 [SSTP/1.1] Method: {}, Sender: {}",
        method, request.sender
    );

    // [sstp.allowcommunicate]: COMMUNICATE メソッド拒否判定
    if method == "COMMUNICATE" && !config.allow_communicate {
        return Ok(SstpResponse {
            status: "420 Refuse".to_string(),
            value: "COMMUNICATE disabled by ghost".to_string(),
            id: None,
            reference0: None,
            additional_data: None,
            error_description: Some("COMMUNICATE disabled by ghost".to_string()),
        });
    }

    // ReceiverGhostName / ReceiverGhostHWnd の宛先検証 (UKADOC SSTP req_res 規格準拠)
    if let Some(ref target_name) = request.receiver_ghost_name {
        let current_name = "Nanai";
        if !target_name.eq_ignore_ascii_case(current_name) {
            return Ok(SstpResponse {
                status: "404 Not Found".to_string(),
                value: format!("Ghost '{}' not found", target_name),
                id: None,
                reference0: None,
                additional_data: None,
                error_description: Some("receiver ghost not found".to_string()),
            });
        }
    }
    if let Some(target_hwnd) = request.receiver_ghost_hwnd {
        let current_hwnd = 0u64;
        if current_hwnd != 0 && target_hwnd != current_hwnd {
            return Ok(SstpResponse {
                status: "404 Not Found".to_string(),
                value: format!("Ghost HWND '{}' not found", target_hwnd),
                id: None,
                reference0: None,
                additional_data: None,
                error_description: Some("receiver ghost hwnd not found".to_string()),
            });
        }
    }

    // [sstp.allowunspecifiedsend]: 無指定 SEND 拒否判定
    if method == "SEND" && !config.allow_unspecified_send {
        let is_specified =
            request.receiver_ghost_name.is_some() || request.receiver_ghost_hwnd.is_some();
        if !is_specified {
            return Ok(SstpResponse {
                status: "420 Refuse".to_string(),
                value: "Unspecified SEND disabled by ghost".to_string(),
                id: None,
                reference0: None,
                additional_data: None,
                error_description: Some("Unspecified SEND disabled by ghost".to_string()),
            });
        }
    }

    match method.as_str() {
        "SEND" | "NOTIFY" => {
            if let Some(ref script) = request.script {
                app_handle
                    .emit("sstp-execute-script", script)
                    .map_err(|e| e.to_string())?;
            }
        }
        "EXECUTE" => {
            if let Some(ref cmd) = request.command {
                let mut properties = HashMap::new();
                properties.insert("ghostlist.count".to_string(), "1".to_string());
                properties.insert("currentghost.name".to_string(), "Nanai".to_string());
                properties.insert(
                    "baseware.name".to_string(),
                    "Nanai Android Mascot".to_string(),
                );
                properties.insert("baseware.version".to_string(), "1.0.0".to_string());

                let ctx = SstpGhostContext {
                    name: "Nanai".to_string(),
                    sakura_name: "Nanai".to_string(),
                    kero_name: "Kero".to_string(),
                    shell_name: "master".to_string(),
                    balloon_name: "standard".to_string(),
                    version: "Nanai 0.1.0".to_string(),
                    short_version: "0.1.0".to_string(),
                    status: String::new(),
                    fmo_text: String::new(),
                    installed_ghosts: vec!["Nanai".to_string()],
                    installed_shells: vec!["master".to_string()],
                    installed_balloons: vec!["standard".to_string()],
                    installed_headlines: Vec::new(),
                    installed_plugins: Vec::new(),
                    properties,
                    cookies: HashMap::new(),
                    sender: request.sender.clone(),
                    sstp_config: config.clone(),
                    security_level: request.security_level.clone(),
                    references: request.references.clone(),
                };
                let resp = handle_execute_command(cmd, &ctx);
                return Ok(SstpResponse {
                    status: format!("{} {}", resp.status.code(), resp.status.reason_phrase()),
                    value: resp.additional_data.clone().unwrap_or_default(),
                    id: request.event,
                    reference0: request.references.get("Reference0").cloned(),
                    additional_data: resp.additional_data,
                    error_description: resp.error_description,
                });
            } else if let Some(ref event) = request.event {
                app_handle
                    .emit("sstp-execute-event", event)
                    .map_err(|e| e.to_string())?;
            }
        }
        "COMMUNICATE" => {
            let payload = request.script.as_deref().or(request.sentence.as_deref());
            if let Some(script) = payload {
                app_handle
                    .emit("sstp-communicate", script)
                    .map_err(|e| e.to_string())?;
            }
        }
        "GIVE" => {
            let payload = request
                .script
                .as_deref()
                .or(request.document.as_deref())
                .or(request.song.as_deref());
            if let Some(script) = payload {
                app_handle
                    .emit("sstp-give", script)
                    .map_err(|e| e.to_string())?;
            }
        }
        _ => {
            return Ok(SstpResponse {
                status: "400 Bad Request".to_string(),
                value: format!("Unsupported SSTP method: {}", method),
                id: None,
                reference0: None,
                additional_data: None,
                error_description: Some("unsupported method".to_string()),
            });
        }
    }

    Ok(SstpResponse {
        status: "200 OK".to_string(),
        value: "SSTP request processed successfully".to_string(),
        id: request.event,
        reference0: request.references.get("Reference0").cloned(),
        additional_data: None,
        error_description: None,
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

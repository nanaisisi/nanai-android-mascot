//! SSTP (SakuraScript Transfer Protocol) 1.x receiver and protocol handler (UKADOC spec compliance)
//! [SSTP/1.x], [req_res], [direct], [method_send], [method_execute], [method_give], [method_communicate], [method_notify], [keepalive]

pub use nanai_android_mascot_ui::sstp::{
    SstpEventBuilder, SstpGhostConfig, SstpGhostContext, SstpRequest as CoreSstpRequest,
    SstpResponse as CoreSstpResponse, handle_execute_command,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::Emitter;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SstpRequest {
    pub method: Option<String>,
    pub sender: String,
    pub script: Option<String>,
    pub event: Option<String>,
    pub hwnd: Option<u64>,
    pub security_level: Option<String>,
    pub security_origin: Option<String>,
    pub id: Option<String>,
    pub options: Vec<String>,
    pub references: HashMap<String, String>,
    pub keep_alive: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub surface: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub document: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub song: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub command: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub module: Option<String>,
    #[serde(default)]
    pub is_direct: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sentence: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub receiver_ghost_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub receiver_ghost_hwnd: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpResponse {
    pub status: String,
    pub value: String,
    pub id: Option<String>,
    pub reference0: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub additional_data: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error_description: Option<String>,
}

/// Parse raw SSTP/1.x request text conforming to UKADOC spec using core parser
pub fn parse_raw_sstp_request(raw: &str) -> Result<SstpRequest, String> {
    let core_req = CoreSstpRequest::parse(raw)?;
    Ok(SstpRequest {
        method: Some(core_req.method.as_str().to_string()),
        sender: core_req.sender,
        script: core_req.script,
        event: core_req.event,
        hwnd: core_req.hwnd,
        security_level: core_req.security_level,
        security_origin: core_req.security_origin,
        id: core_req.id,
        options: core_req.options,
        references: core_req.references,
        keep_alive: Some(core_req.keep_alive),
        surface: core_req.surface,
        document: core_req.document,
        song: core_req.song,
        command: core_req.command,
        module: core_req.module,
        is_direct: core_req.is_direct,
        sentence: core_req.sentence,
        receiver_ghost_name: core_req.receiver_ghost_name,
        receiver_ghost_hwnd: core_req.receiver_ghost_hwnd,
    })
}

/// Parse DirectSSTP raw text (WM_COPYDATA) conforming to UKADOC DirectSSTP spec
pub fn parse_raw_direct_sstp_request(raw: &str) -> Result<SstpRequest, String> {
    let core_req = CoreSstpRequest::parse_direct(raw)?;
    Ok(SstpRequest {
        method: Some(core_req.method.as_str().to_string()),
        sender: core_req.sender,
        script: core_req.script,
        event: core_req.event,
        hwnd: core_req.hwnd,
        security_level: core_req.security_level,
        security_origin: core_req.security_origin,
        id: core_req.id,
        options: core_req.options,
        references: core_req.references,
        keep_alive: Some(core_req.keep_alive),
        surface: core_req.surface,
        document: core_req.document,
        song: core_req.song,
        command: core_req.command,
        module: core_req.module,
        is_direct: true,
        sentence: core_req.sentence,
        receiver_ghost_name: core_req.receiver_ghost_name,
        receiver_ghost_hwnd: core_req.receiver_ghost_hwnd,
    })
}

/// Parse raw SSTP text and format standard UKADOC SSTP response string [req_res]
pub fn parse_and_build_sstp_raw_response(raw_request: &str) -> Result<String, String> {
    parse_and_build_sstp_raw_response_with_config(raw_request, &SstpGhostConfig::default())
}

/// Parse raw SSTP text with ghost-specific SSTP configuration [sstp.allowcommunicate], [sstp.allowunspecifiedsend]
pub fn parse_and_build_sstp_raw_response_with_config(
    raw_request: &str,
    config: &SstpGhostConfig,
) -> Result<String, String> {
    let core_req = CoreSstpRequest::parse(raw_request)?;

    if let Err(refuse_resp) = config.validate_request(&core_req) {
        return Ok(refuse_resp.build());
    }

    if core_req.method == nanai_android_mascot_ui::sstp::SstpMethod::Execute {
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
            sstp_config: config.clone(),
        };
        let cmd = core_req.command.as_deref().unwrap_or("");
        let resp = handle_execute_command(cmd, &ctx);
        return Ok(resp.build());
    }

    let mut resp = CoreSstpResponse::ok(core_req.script);
    if let Some(ref_val) = core_req.references.get("Reference0") {
        resp.references
            .insert("Reference0".to_string(), ref_val.clone());
    }
    Ok(resp.build())
}

/// SSTP ブレイク発生時の通知ペイロード (UKADOC OnSSTPBreak 規格準拠)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpBreakEvent {
    pub script: String,
    pub scope: u32,
    pub break_position: usize,
}

/// SSTP ブラックリスト登録発生時の通知ペイロード (UKADOC OnSSTPBlacklisting 規格準拠)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpBlacklistingEvent {
    pub client_ip: String,
}

/// SSTP 中断 (Break) を通知し OnSSTPBreak イベントペイロードを構築する
#[tauri::command]
pub async fn notify_sstp_break(
    event: SstpBreakEvent,
    app_handle: tauri::AppHandle,
) -> Result<HashMap<String, String>, String> {
    let params =
        SstpEventBuilder::build_on_sstp_break(&event.script, event.scope, event.break_position);
    app_handle
        .emit("sstp-break", &params)
        .map_err(|e| e.to_string())?;
    Ok(params)
}

/// クライアントのブラックリスト登録を通知し OnSSTPBlacklisting イベントペイロードを構築する
#[tauri::command]
pub async fn notify_sstp_blacklisting(
    event: SstpBlacklistingEvent,
    app_handle: tauri::AppHandle,
) -> Result<HashMap<String, String>, String> {
    let params = SstpEventBuilder::build_on_sstp_blacklisting(&event.client_ip);
    app_handle
        .emit("sstp-blacklisting", &params)
        .map_err(|e| e.to_string())?;
    Ok(params)
}

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
                    sstp_config: config.clone(),
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

    #[test]
    fn test_parse_raw_sstp_with_id_and_options() {
        let raw = "SEND SSTP/1.4\r\nSender: TestApp\r\nID: unique_id_01\r\nOption: nobreak, notranslate\r\nScript: \\0Hi\\e\r\n";
        let req = parse_raw_sstp_request(raw).unwrap();
        assert_eq!(req.id, Some("unique_id_01".to_string()));
        assert_eq!(req.options, vec!["nobreak", "notranslate"]);

        let raw_resp = parse_and_build_sstp_raw_response(raw).unwrap();
        assert!(raw_resp.contains("SSTP/1.4 200 OK"));
        assert!(raw_resp.contains("Script: \\0Hi\\e"));
    }

    #[test]
    fn test_parse_raw_execute_command_response() {
        let raw_exec = "EXECUTE SSTP/1.1\r\nSender: Client\r\nCommand: GetName\r\n";
        let resp_str = parse_and_build_sstp_raw_response(raw_exec).unwrap();
        assert!(resp_str.contains("200 OK"));
        assert!(resp_str.contains("Nanai,Kero"));
    }

    #[test]
    fn test_parse_and_build_sstp_with_config_validation() {
        let mut map = HashMap::new();
        map.insert("sstp.allowcommunicate".to_string(), "0".to_string());
        map.insert("sstp.allowunspecifiedsend".to_string(), "0".to_string());
        let config = SstpGhostConfig::from_descript_map(&map);

        let raw_comm = "COMMUNICATE SSTP/1.1\r\nSentence: hello\r\n";
        let resp_comm = parse_and_build_sstp_raw_response_with_config(raw_comm, &config).unwrap();
        assert!(resp_comm.contains("420 Refuse"));
        assert!(resp_comm.contains("COMMUNICATE disabled by ghost"));

        let raw_unspec = "SEND SSTP/1.1\r\nScript: \\0Hello\\e\r\n";
        let resp_unspec =
            parse_and_build_sstp_raw_response_with_config(raw_unspec, &config).unwrap();
        assert!(resp_unspec.contains("420 Refuse"));
        assert!(resp_unspec.contains("Unspecified SEND disabled by ghost"));
    }

    #[test]
    fn test_sstp_break_and_blacklisting_event_structs() {
        let ev = SstpBreakEvent {
            script: "\\0\\s[0]テスト\\e".to_string(),
            scope: 0,
            break_position: 10,
        };
        assert_eq!(ev.scope, 0);
        assert_eq!(ev.break_position, 10);

        let params = SstpEventBuilder::build_on_sstp_break(&ev.script, ev.scope, ev.break_position);
        assert_eq!(params.get("ID"), Some(&"OnSSTPBreak".to_string()));

        let bl_ev = SstpBlacklistingEvent {
            client_ip: "127.0.0.1".to_string(),
        };
        let bl_params = SstpEventBuilder::build_on_sstp_blacklisting(&bl_ev.client_ip);
        assert_eq!(bl_params.get("ID"), Some(&"OnSSTPBlacklisting".to_string()));
        assert_eq!(bl_params.get("Reference0"), Some(&"127.0.0.1".to_string()));
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
            id: Some("id123".to_string()),
            options: vec!["nobreak".to_string()],
            references: HashMap::new(),
            keep_alive: Some(false),
            surface: None,
            document: None,
            song: None,
            command: None,
            module: None,
            is_direct: false,
            ..Default::default()
        };
        assert_eq!(req.sender, "TestApp");
    }
}

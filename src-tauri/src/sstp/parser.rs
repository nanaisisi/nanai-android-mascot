//! SSTP parser module

#![allow(dead_code)]

use super::types::SstpRequest;
use nanai_android_mascot_ui::sstp::{
    SstpGhostConfig, SstpGhostContext, SstpMethod, SstpRequest as CoreSstpRequest,
    SstpResponse as CoreSstpResponse, handle_execute_command,
};

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

    if core_req.method == SstpMethod::Execute {
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
            ..Default::default()
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

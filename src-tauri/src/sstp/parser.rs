//! SSTP parser module

#![allow(dead_code)]

use super::types::SstpRequest;
use crate::ui_adapter::sstp::{
    SstpGhostConfig, SstpGhostContext, SstpMethod, SstpRequest as CoreSstpRequest,
    SstpResponse as CoreSstpResponse, handle_execute_command,
};

/// Parse raw SSTP/1.x request text conforming to UKADOC spec using core parser
pub fn parse_raw_sstp_request(raw: &str) -> Result<SstpRequest, String> {
    let core_req = CoreSstpRequest::parse(raw)?;
    Ok(SstpRequest {
        method: Some(core_req.method().as_str().to_string()),
        sender: core_req.sender().to_string(),
        script: core_req.script().map(ToString::to_string),
        event: core_req.event().map(ToString::to_string),
        hwnd: core_req.hwnd(),
        security_level: core_req.security_level().map(ToString::to_string),
        security_origin: core_req.security_origin().map(ToString::to_string),
        id: core_req.id().map(ToString::to_string),
        options: core_req.options().to_vec(),
        references: core_req.references().clone(),
        connection: core_req.connection().map(ToString::to_string),
        keep_alive: Some(core_req.keep_alive()),
        surface: core_req.surface().map(ToString::to_string),
        document: core_req.document().map(ToString::to_string),
        song: core_req.song().map(ToString::to_string),
        command: core_req.command().map(ToString::to_string),
        module: core_req.module().map(ToString::to_string),
        is_direct: core_req.is_direct(),
        sentence: core_req.sentence().map(ToString::to_string),
        receiver_ghost_name: core_req.receiver_ghost_name().map(ToString::to_string),
        receiver_ghost_hwnd: core_req.receiver_ghost_hwnd(),
    })
}

/// Parse DirectSSTP raw text (WM_COPYDATA) conforming to UKADOC DirectSSTP spec
pub fn parse_raw_direct_sstp_request(raw: &str) -> Result<SstpRequest, String> {
    let core_req = CoreSstpRequest::parse_direct(raw)?;
    Ok(SstpRequest {
        method: Some(core_req.method().as_str().to_string()),
        sender: core_req.sender().to_string(),
        script: core_req.script().map(ToString::to_string),
        event: core_req.event().map(ToString::to_string),
        hwnd: core_req.hwnd(),
        security_level: core_req.security_level().map(ToString::to_string),
        security_origin: core_req.security_origin().map(ToString::to_string),
        id: core_req.id().map(ToString::to_string),
        options: core_req.options().to_vec(),
        references: core_req.references().clone(),
        connection: core_req.connection().map(ToString::to_string),
        keep_alive: Some(core_req.keep_alive()),
        surface: core_req.surface().map(ToString::to_string),
        document: core_req.document().map(ToString::to_string),
        song: core_req.song().map(ToString::to_string),
        command: core_req.command().map(ToString::to_string),
        module: core_req.module().map(ToString::to_string),
        is_direct: true,
        sentence: core_req.sentence().map(ToString::to_string),
        receiver_ghost_name: core_req.receiver_ghost_name().map(ToString::to_string),
        receiver_ghost_hwnd: core_req.receiver_ghost_hwnd(),
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

    if core_req.method() == SstpMethod::Execute {
        let ctx = SstpGhostContext::new("Nanai", "", config.clone())
            .with_security_level(core_req.security_level().map(ToString::to_string))
            .with_references(core_req.references().clone());
        let cmd = core_req.command().unwrap_or("");
        let mut resp = handle_execute_command(cmd, &ctx);
        if let Some(conn) = core_req.connection() {
            resp = resp.with_keep_alive(conn.eq_ignore_ascii_case("keep-alive"));
        } else if core_req.keep_alive() {
            resp = resp.with_keep_alive(true);
        }
        return Ok(resp.build());
    }

    let mut resp = CoreSstpResponse::ok(core_req.script().map(ToString::to_string));
    if let Some(ref_val) = core_req.reference("Reference0") {
        resp.set_reference("Reference0", ref_val);
    }
    if let Some(conn) = core_req.connection() {
        resp = resp.with_keep_alive(conn.eq_ignore_ascii_case("keep-alive"));
    } else if core_req.keep_alive() {
        resp = resp.with_keep_alive(true);
    }
    Ok(resp.build())
}

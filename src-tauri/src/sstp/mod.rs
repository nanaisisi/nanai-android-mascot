//! SSTP (SakuraScript Transfer Protocol) 1.x receiver and protocol handler (UKADOC spec compliance)
//! [SSTP/1.x], [req_res], [direct], [method_send], [method_execute], [method_give], [method_communicate], [method_notify], [keepalive]

pub mod handler;
pub mod parser;
pub mod types;

#[allow(unused_imports)]
pub use handler::{
    notify_sstp_blacklisting, notify_sstp_break, parse_and_send_sstp_raw, send_sstp_request,
    send_sstp_request_with_config,
};
#[allow(unused_imports)]
pub use parser::{
    parse_and_build_sstp_raw_response, parse_and_build_sstp_raw_response_with_config,
    parse_raw_direct_sstp_request, parse_raw_sstp_request,
};
#[allow(unused_imports)]
pub use types::{SstpBlacklistingEvent, SstpBreakEvent, SstpRequest, SstpResponse};

#[allow(unused_imports)]
pub use nanai_android_mascot_ui::sstp::{
    SstpEventBuilder, SstpGhostConfig, SstpGhostContext, SstpRequest as CoreSstpRequest,
    SstpResponse as CoreSstpResponse, handle_execute_command,
};

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

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

    #[test]
    fn test_sstp_receiver_ghost_not_found_handling() {
        let req = SstpRequest {
            method: Some("SEND".to_string()),
            sender: "ClientApp".to_string(),
            receiver_ghost_name: Some("NonExistentGhost".to_string()),
            script: Some("\\0Hi\\e".to_string()),
            ..Default::default()
        };
        assert_eq!(
            req.receiver_ghost_name,
            Some("NonExistentGhost".to_string())
        );
    }
}

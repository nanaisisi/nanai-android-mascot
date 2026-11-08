//! handle_execute_command 各種 EXECUTE コマンド単体テスト群

mod names_status;
mod property_cookie;
mod security_fmo;
mod system_archive;

use super::*;

pub(super) fn create_test_context() -> SstpGhostContext {
    let mut properties = HashMap::new();
    properties.insert("ghostlist.count".to_string(), "2".to_string());
    properties.insert("currentghost.name".to_string(), "Nanai Ghost".to_string());

    let mut cookies = HashMap::new();
    let mut client_cookies = HashMap::new();
    client_cookies.insert("user_token".to_string(), "abc123xyz".to_string());
    cookies.insert("ClientApp".to_string(), client_cookies);

    SstpGhostContext {
        name: "Nanai Ghost".to_string(),
        sakura_name: "Nanai".to_string(),
        kero_name: "Kero".to_string(),
        shell_name: "master".to_string(),
        balloon_name: "standard".to_string(),
        version: "2.0.0".to_string(),
        short_version: "2.0".to_string(),
        status: "talking".to_string(),
        fmo_text: "ssp_fmo_header_001.name\x01Nanai\r\n".to_string(),
        installed_ghosts: vec!["Nanai".to_string(), "Emily".to_string()],
        installed_shells: vec!["master".to_string(), "winter".to_string()],
        installed_balloons: vec!["standard".to_string(), "retro".to_string()],
        installed_headlines: vec!["News RSS".to_string()],
        installed_plugins: vec!["TTS Plugin".to_string()],
        properties,
        cookies,
        sender: "ClientApp".to_string(),
        sstp_config: SstpGhostConfig::default(),
        security_level: Some("local".to_string()),
        references: HashMap::new(),
    }
}

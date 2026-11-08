/**
 * @file ghost_config.rs
 * @brief SstpGhostConfig の descript パースおよびリクエストバリデーション単体テスト
 */

use super::*;

#[test]
fn test_sstp_ghost_config_from_descript_and_validation() {
    let mut map = HashMap::new();
    map.insert("sstp.allowcommunicate".to_string(), "0".to_string());
    map.insert("sstp.allowunspecifiedsend".to_string(), "0".to_string());
    map.insert("sstp.alwaystranslate".to_string(), "1".to_string());

    let config = SstpGhostConfig::from_descript_map(&map);
    assert!(!config.allow_communicate);
    assert!(!config.allow_unspecified_send);
    assert!(config.always_translate);

    // COMMUNICATE リクエストは拒否される
    let req_comm = SstpRequest::parse("COMMUNICATE SSTP/1.1\r\nSentence: test\r\n").unwrap();
    let res = config.validate_request(&req_comm);
    assert!(res.is_err());
    let err_resp = res.unwrap_err();
    assert_eq!(err_resp.status, SstpStatusCode::Refuse);
    assert_eq!(
        err_resp.error_description,
        Some("COMMUNICATE disabled by ghost".to_string())
    );

    // 無指定 SEND リクエストは拒否される
    let req_send_unspec = SstpRequest::parse("SEND SSTP/1.1\r\nScript: \\0Hi\\e\r\n").unwrap();
    let res_unspec = config.validate_request(&req_send_unspec);
    assert!(res_unspec.is_err());
    assert_eq!(res_unspec.unwrap_err().status, SstpStatusCode::Refuse);

    // ゴースト指定あり SEND リクエストは許可される
    let req_send_spec =
        SstpRequest::parse("SEND SSTP/1.1\r\nReceiverGhostName: Nanai\r\nScript: \\0Hi\\e\r\n")
            .unwrap();
    assert!(config.validate_request(&req_send_spec).is_ok());

    // always_translate による notranslate オプション上書き
    let req_notranslate =
        SstpRequest::parse("SEND SSTP/1.1\r\nOption: notranslate\r\nScript: \\0Hi\\e\r\n").unwrap();
    assert!(config.should_translate(&req_notranslate));

    let default_config = SstpGhostConfig::default();
    assert!(!default_config.should_translate(&req_notranslate));
}

use crate::shiori_protocol_helpers::*;
use std::collections::BTreeMap;

#[test]
fn test_build_shiori_request() {
    let mut headers = BTreeMap::new();
    headers.insert("Charset".to_string(), "UTF-8".to_string());
    let req = build_shiori_request("GET", headers);
    assert!(req.contains("GET SHIORI/3.0"));
    assert!(req.contains("Charset: UTF-8"));
}

#[test]
fn test_build_shiori_notify() {
    let refs = vec!["arg0".to_string(), "arg1".to_string()];
    let notify = build_shiori_notify("OnTestEvent", &refs);
    assert!(notify.contains("NOTIFY SHIORI/3.0"));
    assert!(notify.contains("ID: OnTestEvent"));
    assert!(notify.contains("Reference0: arg0"));
    assert!(notify.contains("Reference1: arg1"));
}

#[test]
fn test_build_shiori_request_extended() {
    let params = ShioriExtendedParams {
        charset: Some("UTF-8".into()),
        sender: Some("SSP".into()),
        sender_type: Some("internal,raise".into()),
        security_level: Some("local".into()),
        status: Some("choosing,balloon(0=0)".into()),
        base_id: Some("OnBoot".into()),
    };
    let refs = vec!["1".into()];
    let req = build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnFirstBoot",
        references: &refs,
        params: Some(params),
    });
    assert!(req.contains("GET SHIORI/3.0"));
    assert!(req.contains("Sender: SSP"));
    assert!(req.contains("SenderType: internal,raise"));
    assert!(req.contains("SecurityLevel: local"));
    assert!(req.contains("Status: choosing,balloon(0=0)"));
    assert!(req.contains("ID: OnFirstBoot"));
    assert!(req.contains("BaseID: OnBoot"));
    assert!(req.contains("Reference0: 1"));
}

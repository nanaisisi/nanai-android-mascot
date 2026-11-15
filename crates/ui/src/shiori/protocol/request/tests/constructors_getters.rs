use super::super::*;
use super::super::super::super::types::*;

#[test]
fn test_shiori_request_get_and_notify() {
    let get_req = ShioriRequest::get("OnBoot", &["ref0".into()]);
    assert_eq!(get_req.method, ShioriMethod::Get);
    assert_eq!(get_req.id, "OnBoot");
    assert_eq!(get_req.references, vec!["ref0".to_string()]);

    let notify_req = ShioriRequest::notify("OnClose", &[]);
    assert_eq!(notify_req.method, ShioriMethod::Notify);
    assert_eq!(notify_req.id, "OnClose");

    let cap_req = ShioriRequest::capability(&["test.ref".into()]);
    assert_eq!(cap_req.method, ShioriMethod::Notify);
    assert_eq!(cap_req.id, "capability");
    assert_eq!(cap_req.references, vec!["test.ref".to_string()]);
}

#[test]
fn test_shiori_request_getters() {
    let mut req = ShioriRequest::get("OnBoot", &["ref0".into()]);
    req.charset = "UTF-8".into();
    req.sender = "Tester".into();
    req.sender_type = vec![SenderTypeTag::Internal];
    req.security_level = Some(SecurityLevel::Local);
    req.security_origin = Some(Some("origin".into()));
    req.status = vec![GhostStatusToken::Talking];
    req.base_id = Some("OnFirstBoot".into());
    req.passthru.insert("K".into(), "V".into());

    assert_eq!(req.method(), ShioriMethod::Get);
    assert_eq!(req.charset(), "UTF-8");
    assert_eq!(req.sender(), "Tester");
    assert_eq!(req.sender_type(), &[SenderTypeTag::Internal]);
    assert_eq!(req.security_level(), Some(SecurityLevel::Local));
    assert_eq!(req.security_origin(), Some(Some("origin")));
    assert_eq!(req.status(), &[GhostStatusToken::Talking]);
    assert_eq!(req.id(), "OnBoot");
    assert_eq!(req.base_id(), Some("OnFirstBoot"));
    assert_eq!(req.references(), &["ref0".to_string()]);
    assert_eq!(req.passthru().get("K").map(|s| s.as_str()), Some("V"));
}

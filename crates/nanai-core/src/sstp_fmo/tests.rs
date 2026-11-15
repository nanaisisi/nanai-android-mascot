use super::*;
use std::collections::BTreeMap;

#[test]
fn test_parse_sstp_request() {
    let raw = "NOTIFY SSTP/1.1\r\nSender: TestSender\r\nEvent: OnTest\r\nOption: nobreak\r\n\r\n";
    let req = parse_sstp_request(raw).unwrap();

    assert_eq!(req.command(), "NOTIFY");
    assert_eq!(req.version(), "SSTP/1.1");
    assert_eq!(req.headers().get("Sender").unwrap(), "TestSender");
    assert_eq!(req.headers().get("Event").unwrap(), "OnTest");
}

#[test]
fn test_build_sstp_response() {
    let mut headers = BTreeMap::new();
    headers.insert("Sender".to_string(), "Nanai".to_string());
    let res = build_sstp_response(200, "\\0Hello\\e", headers);
    assert!(res.contains("SSTP/1.1 200 OK"));
    assert!(res.contains("Sender: Nanai"));
    assert!(res.contains("Script: \\0Hello\\e"));
}

#[test]
fn test_parse_fmo_string() {
    let raw = "s0.name\u{0001}Emily\ns0.hwnd\u{0001}12345\n";
    let entries = parse_fmo_string(raw);

    assert_eq!(entries.get("s0").unwrap().ghost_name(), "Emily");
    assert_eq!(entries.get("s0").unwrap().hwnd(), "12345");
}

#[test]
fn test_build_sstp_requests() {
    let notify = build_sstp_notify_request(Build_sstp_notify_requestParams {
        sender: "TestApp",
        event_name: "OnCustomEvent",
        references: &["arg0".to_string()],
    });
    assert!(notify.contains("NOTIFY SSTP/1.1"));
    assert!(notify.contains("Event: OnCustomEvent"));
    assert!(notify.contains("Reference0: arg0"));

    let send = build_sstp_send_request("TestApp", "\\0Hi\\e");
    assert!(send.contains("SEND SSTP/1.1"));
    assert!(send.contains("Script: \\0Hi\\e"));

    let exec = build_sstp_execute_request("TestApp", "choice");
    assert!(exec.contains("EXECUTE SSTP/1.1"));
    assert!(exec.contains("Command: choice"));
}

#[test]
fn test_saori_protocol() {
    let req = build_saori_request("saori.dll", &["param1".to_string()]);
    assert!(req.contains("EXECUTE SAORI/1.0"));
    assert!(req.contains("Module: saori.dll"));
    assert!(req.contains("Argument0: param1"));

    let raw_res = "SAORI/1.0 200 OK\r\nCharset: UTF-8\r\nResult: success\r\nValue0: val0\r\n\r\n";
    let res = parse_saori_response(raw_res).unwrap();
    assert_eq!(res.status(), 200);
    assert_eq!(res.result(), Some("success"));
    assert_eq!(res.values().first().map(String::as_str), Some("val0"));
}

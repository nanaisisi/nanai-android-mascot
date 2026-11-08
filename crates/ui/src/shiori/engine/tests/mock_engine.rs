/**
 * @file mock_engine.rs
 * @brief MockShioriEngine のライフサイクル、サスペンド/レジューム、機能参照テスト
 */

use super::*;

#[test]
fn test_mock_shiori_engine_suspend_and_resume() {
    let mut engine = MockShioriEngine::new();
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Unloaded);

    // ロード前は suspend / resume 不可
    assert!(engine.suspend().is_err());
    assert!(engine.resume().is_err());

    // ロード
    assert!(engine.load(Path::new("/dummy/dir")).is_ok());
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Active);
    assert!(engine.is_loaded());

    // 通常リクエスト
    let boot_req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnBoot\r\n\r\n";
    assert!(engine.request(boot_req).is_ok());

    // サスペンド (バックグラウンド移行)
    assert!(engine.suspend().is_ok());
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Suspended);
    assert!(engine.is_loaded());

    // サスペンド中はリクエスト送信不可
    assert!(engine.request(boot_req).is_err());

    // レジューム (フォアグラウンド復帰)
    assert!(engine.resume().is_ok());
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Active);
    assert!(engine.request(boot_req).is_ok());

    // アンロード
    assert!(engine.unload().is_ok());
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Unloaded);
    assert!(!engine.is_loaded());
}

#[test]
fn test_build_standard_capability_references() {
    let refs = build_standard_capability_references();
    assert!(!refs.is_empty());
    assert!(refs.iter().any(|r| r == "request.status"));
    assert!(refs.iter().any(|r| r == "request.securitylevel"));
    assert!(refs.iter().any(|r| r == "response.value"));
    assert!(refs.iter().any(|r| r == "response.valuenotify"));
    assert!(refs.iter().any(|r| r == "response.marker"));
    assert!(refs.iter().any(|r| r == "response.x-sstp-passthru"));
}

#[test]
fn test_mock_shiori_engine_lifecycle() {
    let mut engine = MockShioriEngine::new();
    assert!(!engine.is_loaded());

    // リクエストをロード前に送るとエラー
    let err = engine.request("GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n");
    assert!(err.is_err());

    // ロード
    assert!(engine.load(Path::new("/dummy/dir")).is_ok());
    assert!(engine.is_loaded());

    // OnBoot
    let boot_req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnBoot\r\n\r\n";
    let boot_res = engine.request(boot_req).unwrap();
    assert!(boot_res.contains("200 OK"));
    assert!(boot_res.contains(r"\0\s[0]起動しました。\e"));

    // NOTIFY リクエストは 204 No Content
    let notify_req = "NOTIFY SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnOther\r\n\r\n";
    let notify_res = engine.request(notify_req).unwrap();
    assert!(notify_res.contains("204 No Content"));

    // カスタムイベント登録
    engine.set_response("OnTestEvent", r"\0\s[0]テスト成功\e");
    let test_req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnTestEvent\r\n\r\n";
    let test_res = engine.request(test_req).unwrap();
    assert!(test_res.contains("200 OK"));
    assert!(test_res.contains("テスト成功"));

    // 未知イベントは 204 No Content
    let unknown_req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnUnknown\r\n\r\n";
    let unknown_res = engine.request(unknown_req).unwrap();
    assert!(unknown_res.contains("204 No Content"));

    // アンロード
    assert!(engine.unload().is_ok());
    assert!(!engine.is_loaded());
}

#[test]
fn test_shiori_engine_trait_default_implementations() {
    struct DefaultEngine;
    impl ShioriEngine for DefaultEngine {
        fn load(&mut self, _: &Path) -> Result<(), String> {
            Ok(())
        }
        fn request(&self, _: &str) -> Result<String, String> {
            Ok("".into())
        }
        fn unload(&mut self) -> Result<(), String> {
            Ok(())
        }
        fn is_loaded(&self) -> bool {
            true
        }
    }

    let mut engine = DefaultEngine;
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Active);
    assert!(engine.suspend().is_ok());
    assert!(engine.resume().is_ok());
}

#[test]
fn test_mock_shiori_engine_error_branches() {
    let mut engine = MockShioriEngine::new();
    // resume when already active
    assert!(engine.load(Path::new("/dummy")).is_ok());
    assert!(engine.resume().is_ok());

    // request with invalid parsing string
    let bad_req = "NOT_A_VALID_REQUEST";
    let res = engine.request(bad_req);
    assert!(res.is_err());

    // empty response handler
    let mut engine2 = MockShioriEngine::new();
    engine2.load(Path::new("/dummy")).unwrap();
    let sec_req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnSecondChange\r\n\r\n";
    let res2 = engine2.request(sec_req).unwrap();
    assert!(res2.contains("204 No Content"));

    let mock_default = MockShioriEngine::default();
    assert!(!mock_default.is_loaded());
}

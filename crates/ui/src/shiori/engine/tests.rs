use super::*;
use std::path::{Path, PathBuf};

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
    assert!(engine.is_loaded()); // メモリ上ロード状態は維持

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
fn test_multistage_shiori_loader_fallback() {
    let mut loader = MultiStageShioriLoader::new();
    assert!(!loader.is_loaded());

    // 存在しない DLL 候補
    loader.add_candidate(ShioriEngineCandidate::Dynamic(PathBuf::from(
        "nonexistent.dll",
    )));
    // WASM 候補 (未構成)
    loader.add_candidate(ShioriEngineCandidate::Wasm(PathBuf::from("engine.wasm")));
    // モック候補 (フォールバック)
    let mut mock = MockShioriEngine::new();
    mock.set_response("OnFallback", r"\0\s[0]フォールバック発動\e");
    loader.add_candidate(ShioriEngineCandidate::Mock(Box::new(mock)));

    let dir = Path::new("/dummy/ghost/master");
    let load_res = loader.load_first_working(
        dir,
        |_path| Err("Dynamic load failed (simulated)".to_string()),
        |_path| Err("WASM load failed (simulated)".to_string()),
    );

    assert!(load_res.is_ok());
    assert!(loader.is_loaded());

    let req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnFallback\r\n\r\n";
    let res = loader.request(req).unwrap();
    assert!(res.contains("200 OK"));
    assert!(res.contains("フォールバック発動"));

    assert!(loader.unload().is_ok());
    assert!(!loader.is_loaded());
}

#[test]
fn test_multistage_shiori_loader_reload_and_prioritization() {
    let mut loader = MultiStageShioriLoader::new();
    assert_eq!(loader.candidate_count(), 0);

    let mut mock1 = MockShioriEngine::new();
    mock1.set_response("OnCheck", r"\0\s[0]初版\e");
    loader.add_candidate(ShioriEngineCandidate::Mock(Box::new(mock1)));
    assert_eq!(loader.candidate_count(), 1);

    // 優先候補の挿入
    let mut mock_priority = MockShioriEngine::new();
    mock_priority.set_response("OnCheck", r"\0\s[0]優先版\e");
    loader.prepend_candidate(ShioriEngineCandidate::Mock(Box::new(mock_priority)));
    assert_eq!(loader.candidate_count(), 2);

    let dir = Path::new("/dummy/ghost/master");
    let load_res = loader.load_first_working(
        dir,
        |_path| Err("No dynamic".to_string()),
        |_path| Err("No wasm".to_string()),
    );
    assert!(load_res.is_ok());
    assert!(loader.last_error().is_none());

    let req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnCheck\r\n\r\n";
    let res = loader.request(req).unwrap();
    assert!(res.contains("優先版"));

    // reload 動作検証
    assert!(loader.reload().is_ok());
    let res_after_reload = loader.request(req).unwrap();
    assert!(res_after_reload.contains("優先版"));

    // アンロード
    assert!(loader.unload().is_ok());
}

#[test]
fn test_shiori_engine_trait_object_default_methods() {
    let mut engine: Box<dyn ShioriEngine> = Box::new(MockShioriEngine::new());
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Unloaded);
    engine.load(Path::new("/dummy")).unwrap();
    assert!(engine.suspend().is_ok());
    assert!(engine.resume().is_ok());
}

#[test]
fn test_multistage_shiori_loader_error_and_edge_cases() {
    let mut loader = MultiStageShioriLoader::default();
    assert!(loader.reload().is_err());

    let dir = Path::new("/dummy/ghost/master");
    let load_res = loader.load_first_working(
        dir,
        |_path| Err("No dynamic".to_string()),
        |_path| Err("No wasm".to_string()),
    );
    assert!(load_res.is_err());
    assert!(loader.last_error().is_some());
    assert!(loader.reload().is_err());

    assert!(loader.load(dir).is_err());
    assert!(loader.request("GET SHIORI/3.0\r\n\r\n").is_err());

    let mock = MockShioriEngine::new();
    loader.add_candidate(ShioriEngineCandidate::Mock(Box::new(mock)));
    assert!(
        loader
            .load_first_working(dir, |_| Err("".into()), |_| Err("".into()))
            .is_ok()
    );
    assert!(loader.active_engine_mut().is_some());
}

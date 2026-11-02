use crate::shiori::{
    MockShioriEngine, MultiStageShioriLoader, ShioriEngine, ShioriEngineCandidate,
};
use std::path::{Path, PathBuf};

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
    let load_res = loader.load_first_working(dir, |_path| {
        Err("Dynamic load failed (simulated)".to_string())
    });

    assert!(load_res.is_ok());
    assert!(loader.is_loaded());

    let req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnFallback\r\n\r\n";
    let res = loader.request(req).unwrap();
    assert!(res.contains("200 OK"));
    assert!(res.contains("フォールバック発動"));

    assert!(loader.unload().is_ok());
    assert!(!loader.is_loaded());
}

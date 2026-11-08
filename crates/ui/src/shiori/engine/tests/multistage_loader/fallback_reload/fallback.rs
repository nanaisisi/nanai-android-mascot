/**
 * @file fallback.rs
 * @brief MultiStageShioriLoader の多段フォールバック（Dynamic -> WASM -> Mock）単体テスト
 */

use super::*;

#[test]
fn test_multistage_shiori_loader_fallback() {
    let mut loader = MultiStageShioriLoader::new();
    assert!(!loader.is_loaded());

    // 存在しない DLL 候補
    loader.add_candidate(ShioriEngineCandidate::Dynamic(PathBuf::from(
        "non_existent.dll",
    )));

    // Wasm 候補
    loader.add_candidate(ShioriEngineCandidate::Wasm(PathBuf::from(
        "non_existent.wasm",
    )));

    // モック候補 (最終フォールバック)
    let mut mock = MockShioriEngine::new();
    mock.set_response("OnBoot", r"\0\s[0]フォールバック成功\e");
    loader.add_candidate(ShioriEngineCandidate::Mock(Box::new(mock)));

    assert_eq!(loader.candidate_count(), 3);

    // ロード試行 (Dynamic, Wasm はコールバックでエラーにし、Mock を成功させる)
    let res = loader.load_first_working(
        Path::new("/dummy/ghost/master"),
        |_| Err("DLL load error".to_string()),
        |_| Err("WASM load error".to_string()),
    );

    assert!(res.is_ok());
    assert!(loader.is_loaded());

    // リクエストがモックエンジンに到達すること
    let boot_req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnBoot\r\n\r\n";
    let res_text = loader.request(boot_req).unwrap();
    assert!(res_text.contains("フォールバック成功"));

    // アンロード
    assert!(loader.unload().is_ok());
    assert!(!loader.is_loaded());
}

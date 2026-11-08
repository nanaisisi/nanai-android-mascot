/**
 * @file prioritization_reload.rs
 * @brief MultiStageShioriLoader の動的ライブラリ/WASM 優先度選択およびホットリロード単体テスト
 */

use super::*;

#[test]
fn test_multistage_shiori_loader_reload_and_prioritization() {
    let dir = Path::new("/dummy/ghost/master");

    // 1. 動的ライブラリ優先 (コールバック成功時)
    let mut loader1 = MultiStageShioriLoader::new();
    loader1.add_candidate(ShioriEngineCandidate::Dynamic(PathBuf::from("good.dll")));
    loader1.add_candidate(ShioriEngineCandidate::Mock(Box::new(
        MockShioriEngine::new(),
    )));

    let res1 = loader1.load_first_working(
        dir,
        |_| {
            let mut mock_dyn = MockShioriEngine::new();
            mock_dyn.set_response("OnBoot", r"\0\s[0]DynamicOK\e");
            Ok(Box::new(mock_dyn) as Box<dyn ShioriEngine>)
        },
        |_| Err("not reached".into()),
    );
    assert!(res1.is_ok());

    let res1_text = loader1
        .request("GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnBoot\r\n\r\n")
        .unwrap();
    assert!(res1_text.contains("DynamicOK"));

    // 2. リロード動作 (reload)
    assert!(loader1.reload().is_ok());
    let res1_reload = loader1
        .request("GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnBoot\r\n\r\n")
        .unwrap();
    assert!(res1_reload.contains("DynamicOK"));

    // 3. Wasm 優先 (Dynamic 失敗、Wasm コールバック成功時)
    let mut loader2 = MultiStageShioriLoader::new();
    loader2.add_candidate(ShioriEngineCandidate::Dynamic(PathBuf::from("bad.dll")));
    loader2.add_candidate(ShioriEngineCandidate::Wasm(PathBuf::from("good.wasm")));

    let res2 = loader2.load_first_working(
        dir,
        |_| Err("DLL load fail".into()),
        |_| {
            let mut mock_wasm = MockShioriEngine::new();
            mock_wasm.set_response("OnBoot", r"\0\s[0]WasmOK\e");
            Ok(Box::new(mock_wasm) as Box<dyn ShioriEngine>)
        },
    );
    assert!(res2.is_ok());

    let res2_text = loader2
        .request("GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnBoot\r\n\r\n")
        .unwrap();
    assert!(res2_text.contains("WasmOK"));
}

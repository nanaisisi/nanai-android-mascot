/**
 * @file fallback_reload.rs
 * @brief MultiStageShioriLoader のフォールバック・優先ロード・リロード単体テスト
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

#[test]
fn test_multistage_shiori_loader_full_coverage() {
    let mut loader = MultiStageShioriLoader::default();
    assert!(!loader.is_loaded());
    assert_eq!(loader.lifecycle_state(), ShioriLifecycleState::Unloaded);
    assert!(loader.suspend().is_ok());
    assert!(loader.resume().is_ok());
    assert!(loader.unload().is_ok());
    assert!(loader.active_engine().is_none());
    assert!(loader.active_engine_mut().is_none());
    assert!(loader.request("GET SHIORI/3.0\r\n\r\n").is_err());
    assert!(
        loader
            .load_first_working(
                Path::new("/dummy"),
                |_| Ok(Box::new(MockShioriEngine::new())),
                |_| Ok(Box::new(MockShioriEngine::new()))
            )
            .is_err()
    );

    let dir = Path::new("/dummy/ghost/master");

    // Dynamic success
    let mut l1 = MultiStageShioriLoader::new();
    l1.add_candidate(ShioriEngineCandidate::Dynamic(PathBuf::from("good.so")));
    let res = l1.load_first_working(
        dir,
        |_| Ok(Box::new(MockShioriEngine::new())),
        |_| Err("err".into()),
    );
    assert!(res.is_ok());
    assert!(l1.is_loaded());
    assert_eq!(l1.lifecycle_state(), ShioriLifecycleState::Active);
    assert!(l1.active_engine().is_some());
    assert!(l1.active_engine_mut().is_some());
    assert!(l1.suspend().is_ok());
    assert_eq!(l1.lifecycle_state(), ShioriLifecycleState::Suspended);
    assert!(l1.resume().is_ok());
    assert_eq!(l1.lifecycle_state(), ShioriLifecycleState::Active);
    assert!(l1.load(dir).is_ok());

    // Dynamic load callback ok but engine.load fails
    struct FailLoadEngine;
    impl ShioriEngine for FailLoadEngine {
        fn load(&mut self, _dir: &Path) -> Result<(), String> {
            Err("failed init".into())
        }
        fn request(&self, _: &str) -> Result<String, String> {
            Ok("".into())
        }
        fn unload(&mut self) -> Result<(), String> {
            Ok(())
        }
        fn is_loaded(&self) -> bool {
            false
        }
    }
    let mut l2 = MultiStageShioriLoader::new();
    l2.add_candidate(ShioriEngineCandidate::Dynamic(PathBuf::from(
        "fail_init.so",
    )));
    let res2 = l2.load_first_working(dir, |_| Ok(Box::new(FailLoadEngine)), |_| Err("err".into()));
    assert!(res2.is_err());

    // Wasm runtime success
    let mut l3 = MultiStageShioriLoader::new();
    l3.add_candidate(ShioriEngineCandidate::Wasm(PathBuf::from("good.wasm")));
    let res3 = l3.load_first_working(
        dir,
        |_| Err("err".into()),
        |_| Ok(Box::new(MockShioriEngine::new())),
    );
    assert!(res3.is_ok());

    // Wasm runtime ok but engine.load fails
    let mut l4 = MultiStageShioriLoader::new();
    l4.add_candidate(ShioriEngineCandidate::Wasm(PathBuf::from("fail_wasm.wasm")));
    let res4 = l4.load_first_working(dir, |_| Err("err".into()), |_| Ok(Box::new(FailLoadEngine)));
    assert!(res4.is_err());

    // Mock candidate engine.load fails
    let mut l5 = MultiStageShioriLoader::new();
    l5.add_candidate(ShioriEngineCandidate::Mock(Box::new(FailLoadEngine)));
    let res5 = l5.load_first_working(dir, |_| Err("err".into()), |_| Err("err".into()));
    assert!(res5.is_err());

    // MultiStageShioriLoader as ShioriEngine::unload & load on active engine
    let mut l5_trait: Box<dyn ShioriEngine> = Box::new(MultiStageShioriLoader::new());
    assert!(l5_trait.unload().is_ok());
    assert!(l5_trait.load(Path::new("/dummy")).is_err());

    // reload when last_dir_path is None
    let mut l_no_dir = MultiStageShioriLoader::new();
    assert!(l_no_dir.reload().is_err());

    // reload error when second load fails during reload
    struct FailSecondLoadEngine {
        count: usize,
    }
    impl ShioriEngine for FailSecondLoadEngine {
        fn load(&mut self, _: &Path) -> Result<(), String> {
            self.count += 1;
            if self.count > 1 {
                Err("second load failed".into())
            } else {
                Ok(())
            }
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
    let mut l_second = MultiStageShioriLoader::new();
    l_second.add_candidate(ShioriEngineCandidate::Mock(Box::new(
        FailSecondLoadEngine { count: 0 },
    )));
    l_second
        .load_first_working(dir, |_| Err("".into()), |_| Err("".into()))
        .unwrap();
    assert!(l_second.reload().is_err());

    // reload error when unload fails
    struct FailUnloadEngine;
    impl ShioriEngine for FailUnloadEngine {
        fn load(&mut self, _: &Path) -> Result<(), String> {
            Ok(())
        }
        fn request(&self, _: &str) -> Result<String, String> {
            Ok("".into())
        }
        fn unload(&mut self) -> Result<(), String> {
            Err("unload failed".into())
        }
        fn is_loaded(&self) -> bool {
            true
        }
    }
    let mut l_unload = MultiStageShioriLoader::new();
    l_unload.add_candidate(ShioriEngineCandidate::Mock(Box::new(FailUnloadEngine)));
    l_unload
        .load_first_working(dir, |_| Err("".into()), |_| Err("".into()))
        .unwrap();
    assert!(l_unload.reload().is_err());

    // Reload with no active engine but with last_dir_path
    let mut l6 = MultiStageShioriLoader::new();
    l6.add_candidate(ShioriEngineCandidate::Mock(Box::new(
        MockShioriEngine::new(),
    )));
    l6.load_first_working(dir, |_| Err("".into()), |_| Err("".into()))
        .unwrap();
    assert!(
        l6.request("GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnBoot\r\n\r\n")
            .is_ok()
    );
    l6.unload().unwrap();
    assert!(l6.reload().is_err());
    assert!(l6.request("GET SHIORI/3.0\r\n\r\n").is_err());
}

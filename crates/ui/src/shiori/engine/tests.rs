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

// Default trait implementations test struct
struct MinimalShioriEngine {
    loaded: bool,
}

impl ShioriEngine for MinimalShioriEngine {
    fn load(&mut self, _dir_path: &Path) -> Result<(), String> {
        self.loaded = true;
        Ok(())
    }
    fn request(&self, _request_str: &str) -> Result<String, String> {
        Ok("SHIORI/3.0 204 No Content\r\n\r\n".to_string())
    }
    fn unload(&mut self) -> Result<(), String> {
        self.loaded = false;
        Ok(())
    }
    fn is_loaded(&self) -> bool {
        self.loaded
    }
}

#[test]
fn test_shiori_engine_trait_default_implementations() {
    let mut engine = MinimalShioriEngine { loaded: false };
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Unloaded);
    assert!(engine.suspend().is_ok());
    assert!(engine.resume().is_ok());

    assert!(engine.load(Path::new("/dummy")).is_ok());
    assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Active);
    assert!(engine.is_loaded());
    assert!(engine.unload().is_ok());
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

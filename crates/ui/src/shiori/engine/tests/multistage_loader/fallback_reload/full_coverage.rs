/**
 * @file full_coverage.rs
 * @brief MultiStageShioriLoader の全機能カバレッジ（サスペンド/レジューム/アンロード/再読み込み異常系）単体テスト
 */

use super::*;

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

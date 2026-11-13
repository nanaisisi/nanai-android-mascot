//! 多段 SHIORI 候補の優先順位解決・ロード実行モジュール

use super::super::trait_def::ShioriEngine;
use super::MultiStageShioriLoader;
use super::types::{CandidateKind, LoadAttempt, ShioriEngineCandidate};
use std::path::Path;

type EngineLoader = dyn FnMut(&Path) -> Result<Box<dyn ShioriEngine>, String>;

impl MultiStageShioriLoader {
    pub(crate) fn load_first_working_inner(
        &mut self,
        dir_path: &Path,
        dynamic_loader: &mut EngineLoader,
        wasm_loader: &mut EngineLoader,
    ) -> Result<(), String> {
        self.unload()?;
        self.last_dir_path = Some(dir_path.to_path_buf());
        self.attempts.clear();

        let mut last_error = "No SHIORI candidates available".to_string();

        for candidate in self.candidates.drain(..) {
            match candidate {
                ShioriEngineCandidate::Dynamic(path) => match dynamic_loader(&path) {
                    Ok(mut engine) => match engine.load(dir_path) {
                        Ok(_) => {
                            self.active_engine = Some(engine);
                            self.active_kind = Some(CandidateKind::Dynamic);
                            self.last_error = None;
                            self.attempts.push(LoadAttempt {
                                kind: CandidateKind::Dynamic,
                                path: Some(path),
                                success: true,
                                error: None,
                            });
                            return Ok(());
                        }
                        Err(e) => {
                            let err_msg = format!("Load failed for {:?}: {}", path, e);
                            self.attempts.push(LoadAttempt {
                                kind: CandidateKind::Dynamic,
                                path: Some(path),
                                success: false,
                                error: Some(err_msg.clone()),
                            });
                            last_error = err_msg;
                        }
                    },
                    Err(e) => {
                        let err_msg = format!("Dynamic load failed for {:?}: {}", path, e);
                        self.attempts.push(LoadAttempt {
                            kind: CandidateKind::Dynamic,
                            path: Some(path),
                            success: false,
                            error: Some(err_msg.clone()),
                        });
                        last_error = err_msg;
                    }
                },
                ShioriEngineCandidate::Wasm(path) => match wasm_loader(&path) {
                    Ok(mut engine) => match engine.load(dir_path) {
                        Ok(_) => {
                            self.active_engine = Some(engine);
                            self.active_kind = Some(CandidateKind::Wasm);
                            self.last_error = None;
                            self.attempts.push(LoadAttempt {
                                kind: CandidateKind::Wasm,
                                path: Some(path),
                                success: true,
                                error: None,
                            });
                            return Ok(());
                        }
                        Err(e) => {
                            let err_msg = format!("WASM load failed for {:?}: {}", path, e);
                            self.attempts.push(LoadAttempt {
                                kind: CandidateKind::Wasm,
                                path: Some(path),
                                success: false,
                                error: Some(err_msg.clone()),
                            });
                            last_error = err_msg;
                        }
                    },
                    Err(e) => {
                        let err_msg = format!("WASM runtime failed for {:?}: {}", path, e);
                        self.attempts.push(LoadAttempt {
                            kind: CandidateKind::Wasm,
                            path: Some(path),
                            success: false,
                            error: Some(err_msg.clone()),
                        });
                        last_error = err_msg;
                    }
                },
                ShioriEngineCandidate::Mock(mut engine) => match engine.load(dir_path) {
                    Ok(_) => {
                        self.active_engine = Some(engine);
                        self.active_kind = Some(CandidateKind::Mock);
                        self.last_error = None;
                        self.attempts.push(LoadAttempt {
                            kind: CandidateKind::Mock,
                            path: None,
                            success: true,
                            error: None,
                        });
                        return Ok(());
                    }
                    Err(e) => {
                        let err_msg = format!("Mock load failed: {}", e);
                        self.attempts.push(LoadAttempt {
                            kind: CandidateKind::Mock,
                            path: None,
                            success: false,
                            error: Some(err_msg.clone()),
                        });
                        last_error = err_msg;
                    }
                },
            }
        }

        self.last_error = Some(last_error.clone());
        Err(last_error)
    }
}

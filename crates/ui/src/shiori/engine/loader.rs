use std::path::{Path, PathBuf};

use super::state::ShioriLifecycleState;
use super::trait_def::ShioriEngine;

/// 候補種別
pub enum ShioriEngineCandidate {
    Dynamic(PathBuf),
    Wasm(PathBuf),
    Mock(Box<dyn ShioriEngine>),
}

/// 候補種別の識別タグ
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CandidateKind {
    Dynamic,
    Wasm,
    Mock,
}

/// ロード試行ログ（フェイルオーバーテレメトリ）
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LoadAttempt {
    pub kind: CandidateKind,
    pub path: Option<PathBuf>,
    pub success: bool,
    pub error: Option<String>,
}

/// 多段 SHIORI ローダー (Multi-stage fallback loader)
///
/// 1. ネイティブ DLL / .so (動的ロード)
/// 2. WebAssembly (.wasm)
/// 3. フォールバック (Mock / JS Bridge)
pub struct MultiStageShioriLoader {
    candidates: Vec<ShioriEngineCandidate>,
    active_engine: Option<Box<dyn ShioriEngine>>,
    active_kind: Option<CandidateKind>,
    last_error: Option<String>,
    last_dir_path: Option<PathBuf>,
    attempts: Vec<LoadAttempt>,
}

impl MultiStageShioriLoader {
    pub fn new() -> Self {
        Self {
            candidates: Vec::new(),
            active_engine: None,
            active_kind: None,
            last_error: None,
            last_dir_path: None,
            attempts: Vec::new(),
        }
    }

    /// 候補の追加
    pub fn add_candidate(&mut self, candidate: ShioriEngineCandidate) {
        self.candidates.push(candidate);
    }

    /// 候補の優先追加（先頭に挿入）
    pub fn prepend_candidate(&mut self, candidate: ShioriEngineCandidate) {
        self.candidates.insert(0, candidate);
    }

    /// 候補数を取得
    pub fn candidate_count(&self) -> usize {
        self.candidates.len()
    }

    /// 候補一覧をクリア
    pub fn clear_candidates(&mut self) {
        self.candidates.clear();
    }

    /// 直近のエラー文字列を取得
    pub fn last_error(&self) -> Option<&str> {
        self.last_error.as_deref()
    }

    /// アクティブなエンジンの種類を取得
    pub fn active_kind(&self) -> Option<CandidateKind> {
        self.active_kind
    }

    /// ロード試行履歴を取得
    pub fn load_attempts(&self) -> &[LoadAttempt] {
        &self.attempts
    }

    /// 試行履歴をクリア
    pub fn clear_attempts(&mut self) {
        self.attempts.clear();
    }

    /// アクティブなエンジンの参照を取得
    pub fn active_engine(&self) -> Option<&(dyn ShioriEngine + 'static)> {
        self.active_engine.as_deref()
    }

    /// アクティブなエンジンの可変参照を取得
    pub fn active_engine_mut(&mut self) -> Option<&mut (dyn ShioriEngine + 'static)> {
        self.active_engine.as_deref_mut()
    }

    /// 現在ロードされているエンジンをアンロード
    pub fn unload(&mut self) -> Result<(), String> {
        self.active_kind = None;
        if let Some(mut engine) = self.active_engine.take() {
            engine.unload()?;
        }
        Ok(())
    }

    /// アクティブなエンジンを再読み込み (`\![reload,shiori]` 対応)
    pub fn reload(&mut self) -> Result<(), String> {
        if let Some(dir) = self.last_dir_path.clone() {
            if let Some(engine) = self.active_engine.as_mut() {
                engine.unload()?;
                engine.load(&dir)?;
                return Ok(());
            }
            Err("No active engine to reload".to_string())
        } else {
            Err("No directory previously loaded to reload".to_string())
        }
    }

    /// 登録済みの候補を順に解決・ロード (WASM ローダー解決フック対応)
    pub fn load_first_working<F, W>(
        &mut self,
        dir_path: &Path,
        mut dynamic_loader: F,
        mut wasm_loader: W,
    ) -> Result<(), String>
    where
        F: FnMut(&Path) -> Result<Box<dyn ShioriEngine>, String>,
        W: FnMut(&Path) -> Result<Box<dyn ShioriEngine>, String>,
    {
        self.load_first_working_inner(dir_path, &mut dynamic_loader, &mut wasm_loader)
    }

    fn load_first_working_inner(
        &mut self,
        dir_path: &Path,
        dynamic_loader: &mut dyn FnMut(&Path) -> Result<Box<dyn ShioriEngine>, String>,
        wasm_loader: &mut dyn FnMut(&Path) -> Result<Box<dyn ShioriEngine>, String>,
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

impl Default for MultiStageShioriLoader {
    fn default() -> Self {
        Self::new()
    }
}

impl ShioriEngine for MultiStageShioriLoader {
    fn load(&mut self, _dir_path: &Path) -> Result<(), String> {
        if let Some(engine) = self.active_engine.as_mut() {
            engine.load(_dir_path)
        } else {
            Err("No active engine selected".to_string())
        }
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        if let Some(engine) = self.active_engine.as_ref() {
            engine.request(request_str)
        } else {
            Err("No active engine loaded".to_string())
        }
    }

    fn unload(&mut self) -> Result<(), String> {
        self.unload()
    }

    fn is_loaded(&self) -> bool {
        self.active_engine
            .as_ref()
            .map(|e| e.is_loaded())
            .unwrap_or(false)
    }

    fn suspend(&mut self) -> Result<(), String> {
        if let Some(engine) = self.active_engine.as_mut() {
            engine.suspend()
        } else {
            Ok(())
        }
    }

    fn resume(&mut self) -> Result<(), String> {
        if let Some(engine) = self.active_engine.as_mut() {
            engine.resume()
        } else {
            Ok(())
        }
    }

    fn lifecycle_state(&self) -> ShioriLifecycleState {
        self.active_engine
            .as_ref()
            .map(|e| e.lifecycle_state())
            .unwrap_or(ShioriLifecycleState::Unloaded)
    }
}

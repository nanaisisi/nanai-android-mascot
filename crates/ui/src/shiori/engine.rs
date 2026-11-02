//! SHIORI/3.0 エンジン抽象レイヤー (Slot-02 Contract)
//!
//! SHIORI C-ABI DLL, WASM, およびモック/スクリプトエンジンを統一的に扱う抽象トレイト `ShioriEngine`
//! ならびに多段フォールバックローダー `MultiStageShioriLoader` を提供する。

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use super::protocol::{ShioriRequest, ShioriResponse};

/// SHIORI エンジンのライフサイクル状態 (Slot-02 Cycle 3: モバイル・省電力最適化)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ShioriLifecycleState {
    /// 未初期化・アンロード状態
    #[default]
    Unloaded,
    /// アクティブ・稼働中状態
    Active,
    /// バックグラウンド一時停止・省電力待機状態
    Suspended,
    /// 破棄済み状態
    Destroyed,
}

/// UKADOC SHIORI/3.0 `capability` Notify イベント用リファレンス一覧を生成
///
/// SSP/UKADOC spec `list/shiori-event/notify/capability.md` 準拠:
/// request.(ヘッダ小文字), response.(ヘッダ小文字) を Reference0..N に設定する
pub fn build_standard_capability_references() -> Vec<String> {
    vec![
        // Request ヘッダ対応状況
        "request.sender".to_string(),
        "request.sendertype".to_string(),
        "request.securitylevel".to_string(),
        "request.securityorigin".to_string(),
        "request.status".to_string(),
        "request.baseid".to_string(),
        "request.x-sstp-passthru".to_string(),
        // Response ヘッダ対応状況
        "response.value".to_string(),
        "response.valuenotify".to_string(),
        "response.marker".to_string(),
        "response.markersend".to_string(),
        "response.balloonoffset".to_string(),
        "response.age".to_string(),
        "response.errorlevel".to_string(),
        "response.errordescription".to_string(),
        "response.x-sstp-passthru".to_string(),
    ]
}

/// SHIORI/3.0 エンジントレイト
pub trait ShioriEngine: Send + Sync {
    /// SHIORI エンジンのロード・初期化
    ///
    /// 辞書やマスターファイルが配置されているディレクトリパスを受け取る
    fn load(&mut self, dir_path: &Path) -> Result<(), String>;

    /// SHIORI/3.0 リクエストの同期送信
    fn request(&self, request_str: &str) -> Result<String, String>;

    /// SHIORI エンジンのアンロード・解放
    fn unload(&mut self) -> Result<(), String>;

    /// エンジンがロード済みか否か
    fn is_loaded(&self) -> bool;

    /// モバイル/バックグラウンド移行時のサスペンド (省電力・メモリ圧縮)
    fn suspend(&mut self) -> Result<(), String> {
        Ok(())
    }

    /// フォアグラウンド復帰時のレジューム
    fn resume(&mut self) -> Result<(), String> {
        Ok(())
    }

    /// 現在のライフサイクル状態を取得
    fn lifecycle_state(&self) -> ShioriLifecycleState {
        if self.is_loaded() {
            ShioriLifecycleState::Active
        } else {
            ShioriLifecycleState::Unloaded
        }
    }
}

/// テスト・スタンドアロン実行用のモック SHIORI エンジン
pub struct MockShioriEngine {
    state: ShioriLifecycleState,
    dir_path: Option<PathBuf>,
    handlers: HashMap<String, String>,
}

impl MockShioriEngine {
    pub fn new() -> Self {
        let mut handlers = HashMap::new();
        handlers.insert("OnBoot".to_string(), r"\0\s[0]起動しました。\e".to_string());
        handlers.insert(
            "OnClose".to_string(),
            r"\0\s[0]終了します。さようなら。\w9\w9\-\e".to_string(),
        );
        handlers.insert(
            "OnMouseClick".to_string(),
            r"\0\s[0]クリックされました。\e".to_string(),
        );
        handlers.insert(
            "OnSecondChange".to_string(),
            String::new(), // 空応答 (204 No Content になる)
        );

        Self {
            state: ShioriLifecycleState::Unloaded,
            dir_path: None,
            handlers,
        }
    }

    /// 特定イベントへの応答スクリプトを登録
    pub fn set_response(&mut self, event_id: impl Into<String>, script: impl Into<String>) {
        self.handlers.insert(event_id.into(), script.into());
    }
}

impl Default for MockShioriEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl ShioriEngine for MockShioriEngine {
    fn load(&mut self, dir_path: &Path) -> Result<(), String> {
        self.state = ShioriLifecycleState::Active;
        self.dir_path = Some(dir_path.to_path_buf());
        Ok(())
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        if self.state == ShioriLifecycleState::Suspended {
            return Err("SHIORI is suspended".to_string());
        }
        if self.state != ShioriLifecycleState::Active {
            return Err("SHIORI is not loaded".to_string());
        }

        let parsed = ShioriRequest::parse(request_str)
            .map_err(|e| format!("Failed to parse request: {:?}", e))?;

        if parsed.method == super::types::ShioriMethod::Notify {
            return Ok(ShioriResponse::no_content().build());
        }

        if let Some(script) = self.handlers.get(&parsed.id) {
            if script.is_empty() {
                Ok(ShioriResponse::no_content().build())
            } else {
                let mut resp = ShioriResponse::ok(script);
                resp.charset = "UTF-8".to_string();
                Ok(resp.build())
            }
        } else {
            // 未知イベントは 204 No Content
            Ok(ShioriResponse::no_content().build())
        }
    }

    fn unload(&mut self) -> Result<(), String> {
        self.state = ShioriLifecycleState::Unloaded;
        self.dir_path = None;
        Ok(())
    }

    fn is_loaded(&self) -> bool {
        self.state == ShioriLifecycleState::Active || self.state == ShioriLifecycleState::Suspended
    }

    fn suspend(&mut self) -> Result<(), String> {
        if self.is_loaded() {
            self.state = ShioriLifecycleState::Suspended;
            Ok(())
        } else {
            Err("Cannot suspend unloaded SHIORI".to_string())
        }
    }

    fn resume(&mut self) -> Result<(), String> {
        if self.state == ShioriLifecycleState::Suspended {
            self.state = ShioriLifecycleState::Active;
            Ok(())
        } else if self.state == ShioriLifecycleState::Active {
            Ok(())
        } else {
            Err("Cannot resume unloaded SHIORI".to_string())
        }
    }

    fn lifecycle_state(&self) -> ShioriLifecycleState {
        self.state
    }
}

/// 候補種別
pub enum ShioriEngineCandidate {
    Dynamic(PathBuf),
    Wasm(PathBuf),
    Mock(Box<dyn ShioriEngine>),
}

/// 多段 SHIORI ローダー (Multi-stage fallback loader)
///
/// 1. ネイティブ DLL / .so (動的ロード)
/// 2. WebAssembly (.wasm)
/// 3. フォールバック (Mock / JS Bridge)
pub struct MultiStageShioriLoader {
    candidates: Vec<ShioriEngineCandidate>,
    active_engine: Option<Box<dyn ShioriEngine>>,
}

impl MultiStageShioriLoader {
    pub fn new() -> Self {
        Self {
            candidates: Vec::new(),
            active_engine: None,
        }
    }

    /// 候補の追加
    pub fn add_candidate(&mut self, candidate: ShioriEngineCandidate) {
        self.candidates.push(candidate);
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
        if let Some(mut engine) = self.active_engine.take() {
            engine.unload()?;
        }
        Ok(())
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
        self.unload()?;

        let mut last_error = "No SHIORI candidates available".to_string();

        for candidate in self.candidates.drain(..) {
            match candidate {
                ShioriEngineCandidate::Dynamic(path) => match dynamic_loader(&path) {
                    Ok(mut engine) => match engine.load(dir_path) {
                        Ok(_) => {
                            self.active_engine = Some(engine);
                            return Ok(());
                        }
                        Err(e) => {
                            last_error = format!("Load failed for {:?}: {}", path, e);
                        }
                    },
                    Err(e) => {
                        last_error = format!("Dynamic load failed for {:?}: {}", path, e);
                    }
                },
                ShioriEngineCandidate::Wasm(path) => match wasm_loader(&path) {
                    Ok(mut engine) => match engine.load(dir_path) {
                        Ok(_) => {
                            self.active_engine = Some(engine);
                            return Ok(());
                        }
                        Err(e) => {
                            last_error = format!("WASM load failed for {:?}: {}", path, e);
                        }
                    },
                    Err(e) => {
                        last_error = format!("WASM runtime failed for {:?}: {}", path, e);
                    }
                },
                ShioriEngineCandidate::Mock(mut engine) => {
                    if engine.load(dir_path).is_ok() {
                        self.active_engine = Some(engine);
                        return Ok(());
                    }
                }
            }
        }

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

//! Pure WASM Core State Machine (Single Source of Truth)

use std::collections::{HashMap, VecDeque};
use serde::{Deserialize, Serialize};

use crate::sakura_script::{parse_sakura_script, SakuraToken};

/// 毎フレームの WASM Engine Tick 実行結果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MascotTickResult {
    pub current_token: Option<SakuraToken>,
    pub updated_scopes: Vec<u32>,
    pub is_playing: bool,
    pub uptime_ms: f64,
}

/// アプリケーション全体の統合エンジン状態
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MascotEngineState {
    pub current_ghost: String,
    pub current_shell: String,
    pub balloon_theme: String,
    pub active_scope: u32,
    pub current_surfaces: HashMap<u32, u32>,
    pub active_binds: Vec<u32>,
    pub script_queue: VecDeque<SakuraToken>,
    pub is_playing_script: bool,
    pub uptime_ms: f64,
}

impl Default for MascotEngineState {
    fn default() -> Self {
        let mut surfaces = HashMap::new();
        surfaces.insert(0, 0);   // Scope 0 (Sakura) default surface 0
        surfaces.insert(1, 10);  // Scope 1 (Kero) default surface 10

        Self {
            current_ghost: "default".to_string(),
            current_shell: "master".to_string(),
            balloon_theme: "default".to_string(),
            active_scope: 0,
            current_surfaces: surfaces,
            active_binds: Vec::new(),
            script_queue: VecDeque::new(),
            is_playing_script: false,
            uptime_ms: 0.0,
        }
    }
}

impl MascotEngineState {
    /// 新規エンジン状態生成
    pub fn new() -> Self {
        Self::default()
    }

    /// ゴースト選択・変更
    pub fn select_ghost(&mut self, ghost_name: &str) {
        self.current_ghost = ghost_name.to_string();
    }

    /// シェル選択・変更
    pub fn select_shell(&mut self, shell_name: &str) {
        self.current_shell = shell_name.to_string();
    }

    /// バルーンテーマ設定
    pub fn set_balloon_theme(&mut self, theme: &str) {
        self.balloon_theme = theme.to_string();
    }

    /// 特定スコープのサーフェスID設定
    pub fn set_surface(&mut self, scope: u32, surface_id: u32) {
        self.current_surfaces.insert(scope, surface_id);
    }

    /// 現在のサーフェスID取得
    pub fn get_surface(&self, scope: u32) -> u32 {
        *self.current_surfaces.get(&scope).unwrap_or(&0)
    }

    /// 着せ替え (Bind) アロケーション追加/削除
    pub fn toggle_bind(&mut self, bind_id: u32) {
        if let Some(pos) = self.active_binds.iter().position(|&b| b == bind_id) {
            self.active_binds.remove(pos);
        } else {
            self.active_binds.push(bind_id);
        }
    }

    /// さくらスクリプト文字列をパースして再生キューへ追加
    pub fn enqueue_script(&mut self, script: &str) {
        let tokens = parse_sakura_script(script);
        for token in tokens {
            self.script_queue.push_back(token);
        }
        self.is_playing_script = !self.script_queue.is_empty();
    }

    /// 再生キューから次のトークンを取り出し
    pub fn pop_next_script_token(&mut self) -> Option<SakuraToken> {
        let token = self.script_queue.pop_front();
        self.is_playing_script = !self.script_queue.is_empty();
        token
    }

    /// 再生キューのクリア
    pub fn clear_script_queue(&mut self) {
        self.script_queue.clear();
        self.is_playing_script = false;
    }

    /// フレーム進行 tick (アニメーション・スクリプトキュー・タイマー更新)
    pub fn tick(&mut self, delta_ms: f64) -> MascotTickResult {
        self.uptime_ms += delta_ms;

        let current_token = if self.is_playing_script {
            self.pop_next_script_token()
        } else {
            None
        };

        let mut updated_scopes = Vec::new();
        if let Some(ref token) = current_token {
            match token {
                SakuraToken::Scope(sc) => {
                    self.active_scope = *sc;
                }
                SakuraToken::Surface(sid) => {
                    if *sid >= 0 {
                        let sc = self.active_scope;
                        self.set_surface(sc, *sid as u32);
                        updated_scopes.push(sc);
                    }
                }
                _ => {}
            }
        }

        MascotTickResult {
            current_token,
            updated_scopes,
            is_playing: self.is_playing_script,
            uptime_ms: self.uptime_ms,
        }
    }
}

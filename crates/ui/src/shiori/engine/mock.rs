use std::collections::HashMap;
use std::path::{Path, PathBuf};

use super::state::ShioriLifecycleState;
use super::trait_def::ShioriEngine;
use crate::shiori::protocol::{ShioriRequest, ShioriResponse};
use crate::shiori::types::ShioriMethod;

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

        if parsed.method == ShioriMethod::Notify {
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

//! ShioriEngine Trait Implementation for ShioriDynamicEngine

use super::engine::ShioriDynamicEngine;
use nanai_android_mascot_ui::{ShioriEngine, ShioriLifecycleState};
use std::path::Path;

impl ShioriEngine for ShioriDynamicEngine {
    fn load(&mut self, dir_path: &Path) -> Result<(), String> {
        self.initialize(dir_path).map_err(|e| e.to_string())
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        self.request(request_str)
    }

    fn unload(&mut self) -> Result<(), String> {
        self.unload()
    }

    fn is_loaded(&self) -> bool {
        self.is_loaded
    }

    fn suspend(&mut self) -> Result<(), String> {
        // ネイティブ DLL の場合はライフサイクル通知 (OnSysSuspend 等) と連携
        Ok(())
    }

    fn resume(&mut self) -> Result<(), String> {
        // ネイティブ DLL の復帰
        Ok(())
    }

    fn lifecycle_state(&self) -> ShioriLifecycleState {
        if self.is_loaded {
            ShioriLifecycleState::Active
        } else {
            ShioriLifecycleState::Unloaded
        }
    }
}

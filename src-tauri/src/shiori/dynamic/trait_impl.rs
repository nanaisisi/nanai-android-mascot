//! ShioriEngine Trait Implementation for ShioriDynamicEngine

use super::engine::ShioriDynamicEngine;
use nanai_android_mascot_ui::{ShioriEngine, ShioriLifecycleState};
use std::path::Path;

impl ShioriEngine for ShioriDynamicEngine {
    fn load(&mut self, dir_path: &Path) -> Result<(), String> {
        self.load_engine(dir_path)
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        self.request(request_str)
    }

    fn unload(&mut self) -> Result<(), String> {
        self.unload_engine()
    }

    fn is_loaded(&self) -> bool {
        self.is_loaded
    }

    fn suspend(&mut self) -> Result<(), String> {
        Ok(())
    }

    fn resume(&mut self) -> Result<(), String> {
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

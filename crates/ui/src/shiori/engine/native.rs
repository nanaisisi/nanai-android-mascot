//! Platform Native / Statically Linked SHIORI Engine Implementation

use std::path::Path;
use nanai_shiori_vm::dynamic_loader::NativeShioriEngine as VmNativeEngine;
use super::state::ShioriLifecycleState;
use super::trait_def::ShioriEngine;

/// Platform-Native SHIORI 3.0 Engine wrapper (Direct Native/Static Linking)
pub struct NativeShioriEngine {
    inner: VmNativeEngine,
}

impl NativeShioriEngine {
    pub fn new(engine_name: &str) -> Self {
        Self {
            inner: VmNativeEngine::new(engine_name),
        }
    }

    pub fn engine_name(&self) -> &str {
        self.inner.engine_name()
    }
}

impl ShioriEngine for NativeShioriEngine {
    fn load(&mut self, dir_path: &Path) -> Result<(), String> {
        self.inner.load(dir_path).map(|_| ())
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        self.inner.request(request_str)
    }

    fn unload(&mut self) -> Result<(), String> {
        self.inner.unload().map(|_| ())
    }

    fn is_loaded(&self) -> bool {
        self.inner.is_loaded()
    }

    fn lifecycle_state(&self) -> ShioriLifecycleState {
        if self.is_loaded() {
            ShioriLifecycleState::Active
        } else {
            ShioriLifecycleState::Unloaded
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_native_shiori_engine_wrapper() {
        let mut engine = NativeShioriEngine::new("satori");
        assert!(!engine.is_loaded());

        assert!(engine.load(Path::new("/tmp/ghost")).is_ok());
        assert!(engine.is_loaded());

        let res = engine.request("GET SHIORI/3.0\r\nID: version\r\n\r\n");
        assert!(res.is_ok());
        assert!(res.unwrap().contains("satori"));

        assert!(engine.unload().is_ok());
        assert!(!engine.is_loaded());
    }
}

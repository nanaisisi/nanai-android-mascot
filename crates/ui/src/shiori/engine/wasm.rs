//! WebAssembly SHIORI エンジンサンドボックス (`wasmi` / `nanai-shiori-vm` 統合)
//!
//! サードパーティ製 WebAssembly (WASM) SHIORI モジュールを安全にロード・実行する。

use super::trait_def::ShioriEngine;
use nanai_shiori_vm::ShioriVmHost;
use std::path::Path;
use std::sync::Mutex;

/// WASM ベースの SHIORI/3.0 エンジンサンドボックス
pub struct WasmShioriEngine {
    vm_host: Mutex<ShioriVmHost>,
    has_bytecode: bool,
}

impl Default for WasmShioriEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl WasmShioriEngine {
    /// 新しい WASM SHIORI エンジンインスタンスを生成する
    pub fn new() -> Self {
        Self {
            vm_host: Mutex::new(ShioriVmHost::new()),
            has_bytecode: false,
        }
    }

    /// WASM バイトコードからモジュールをコンパイルする
    pub fn load_bytecode(&mut self, wasm_bytes: &[u8]) -> Result<(), String> {
        let mut host = self
            .vm_host
            .lock()
            .map_err(|e| format!("Failed to lock VM host: {}", e))?;
        host.load_bytecode(wasm_bytes)?;
        self.has_bytecode = true;
        Ok(())
    }
}

impl ShioriEngine for WasmShioriEngine {
    fn load(&mut self, dir_path: &Path) -> Result<(), String> {
        if !self.has_bytecode {
            return Err("WASM module not loaded via load_bytecode".to_string());
        }
        let dir_str = dir_path.to_string_lossy();
        let mut host = self
            .vm_host
            .lock()
            .map_err(|e| format!("Failed to lock VM host: {}", e))?;
        host.call_load(&dir_str).map(|_| ())
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        let mut host = self
            .vm_host
            .lock()
            .map_err(|e| format!("Failed to lock VM host: {}", e))?;
        host.call_request(request_str)
    }

    fn unload(&mut self) -> Result<(), String> {
        let mut host = self
            .vm_host
            .lock()
            .map_err(|e| format!("Failed to lock VM host: {}", e))?;
        host.call_unload().map(|_| ())
    }

    fn is_loaded(&self) -> bool {
        if let Ok(host) = self.vm_host.lock() {
            host.is_loaded()
        } else {
            false
        }
    }
}

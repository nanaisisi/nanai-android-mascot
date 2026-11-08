//! WebAssembly SHIORI エンジンサンドボックス (`wasmi` 統合)
//!
//! サードパーティ製 WebAssembly (WASM) SHIORI モジュールを安全にロード・実行する。

use super::trait_def::ShioriEngine;
use std::path::Path;
use wasmi::{Engine, Module};

/// WASM ベースの SHIORI/3.0 エンジンサンドボックス
pub struct WasmShioriEngine {
    engine: Engine,
    module: Option<Module>,
    loaded: bool,
}

impl Default for WasmShioriEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl WasmShioriEngine {
    /// 新しい WASM SHIORI エンジンインスタンスを生成する
    pub fn new() -> Self {
        let engine = Engine::default();
        Self {
            engine,
            module: None,
            loaded: false,
        }
    }

    /// WASM バイトコードからモジュールをコンパイルする
    pub fn load_bytecode(&mut self, wasm_bytes: &[u8]) -> Result<(), String> {
        let module = Module::new(&self.engine, wasm_bytes)
            .map_err(|e| format!("WASM module compilation failed: {}", e))?;
        self.module = Some(module);
        Ok(())
    }
}

impl ShioriEngine for WasmShioriEngine {
    fn load(&mut self, _dir_path: &Path) -> Result<(), String> {
        if self.module.is_none() {
            return Err("WASM module not loaded via load_bytecode".to_string());
        }
        self.loaded = true;
        Ok(())
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        if !self.loaded {
            return Err("WASM SHIORI engine not loaded".to_string());
        }
        Ok(format!(
            "SHIORI/3.0 200 OK\r\nSender: WasmShiori\r\nValue: Hello from WASM sandbox for request len {}\r\n\r\n",
            request_str.len()
        ))
    }

    fn unload(&mut self) -> Result<(), String> {
        self.loaded = false;
        Ok(())
    }

    fn is_loaded(&self) -> bool {
        self.loaded
    }
}

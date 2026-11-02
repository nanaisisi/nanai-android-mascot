//! SHIORI WebAssembly Engine (Slot-02 Contract)
//!
//! WASM 形式の SHIORI エンジン実行、およびメモリ上仮想ファイルシステムとの連携準備。

#![allow(dead_code)]

use nanai_android_mascot_ui::{ShioriEngine, ShioriLifecycleState};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// WebAssembly 形式の SHIORI/3.0 実行エンジン
pub struct WasmShioriEngine {
    wasm_path: PathBuf,
    state: ShioriLifecycleState,
    virtual_fs: HashMap<String, Vec<u8>>,
    dir_path: Option<PathBuf>,
}

impl WasmShioriEngine {
    pub fn new(wasm_path: impl Into<PathBuf>) -> Self {
        Self {
            wasm_path: wasm_path.into(),
            state: ShioriLifecycleState::Unloaded,
            virtual_fs: HashMap::new(),
            dir_path: None,
        }
    }

    /// WASM 仮想ファイルシステムにファイルデータをロード
    pub fn mount_virtual_file(&mut self, path: impl Into<String>, data: Vec<u8>) {
        self.virtual_fs.insert(path.into(), data);
    }

    /// WASM 仮想ファイルシステムのファイル一覧
    pub fn virtual_files(&self) -> &HashMap<String, Vec<u8>> {
        &self.virtual_fs
    }

    /// 対象の WASM パス
    pub fn wasm_path(&self) -> &Path {
        &self.wasm_path
    }
}

impl ShioriEngine for WasmShioriEngine {
    fn load(&mut self, dir_path: &Path) -> Result<(), String> {
        self.dir_path = Some(dir_path.to_path_buf());
        self.state = ShioriLifecycleState::Active;
        println!("🌐 WASM SHIORI initialized from {:?}", self.wasm_path);
        Ok(())
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        if self.state == ShioriLifecycleState::Suspended {
            return Err("WASM SHIORI is suspended".to_string());
        }
        if self.state != ShioriLifecycleState::Active {
            return Err("WASM SHIORI is not loaded".to_string());
        }

        // WASM ランタイムとの対話モック/フォールバック
        if request_str.starts_with("NOTIFY") {
            return Ok("SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string());
        }

        Ok("SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]WASM SHIORI 応答です。\\e\r\n\r\n".to_string())
    }

    fn unload(&mut self) -> Result<(), String> {
        self.state = ShioriLifecycleState::Unloaded;
        self.dir_path = None;
        println!("🔌 WASM SHIORI unloaded: {:?}", self.wasm_path);
        Ok(())
    }

    fn is_loaded(&self) -> bool {
        self.state == ShioriLifecycleState::Active || self.state == ShioriLifecycleState::Suspended
    }

    fn suspend(&mut self) -> Result<(), String> {
        if self.is_loaded() {
            self.state = ShioriLifecycleState::Suspended;
            println!(
                "💤 WASM SHIORI suspended (power-saving/memory-compacted): {:?}",
                self.wasm_path
            );
            Ok(())
        } else {
            Err("Cannot suspend unloaded WASM SHIORI".to_string())
        }
    }

    fn resume(&mut self) -> Result<(), String> {
        if self.state == ShioriLifecycleState::Suspended {
            self.state = ShioriLifecycleState::Active;
            println!("⚡ WASM SHIORI resumed to active: {:?}", self.wasm_path);
            Ok(())
        } else if self.state == ShioriLifecycleState::Active {
            Ok(())
        } else {
            Err("Cannot resume unloaded WASM SHIORI".to_string())
        }
    }

    fn lifecycle_state(&self) -> ShioriLifecycleState {
        self.state
    }
}

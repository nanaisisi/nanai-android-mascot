//! SHIORI WebAssembly Engine (Slot-02 Contract)
//!
//! WASM 形式の SHIORI エンジン実行、およびメモリ上仮想ファイルシステムとの連携準備。

use nanai_android_mascot_ui::ShioriEngine;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// WebAssembly 形式の SHIORI/3.0 実行エンジン
pub struct WasmShioriEngine {
    wasm_path: PathBuf,
    is_loaded: bool,
    virtual_fs: HashMap<String, Vec<u8>>,
    dir_path: Option<PathBuf>,
}

impl WasmShioriEngine {
    pub fn new(wasm_path: impl Into<PathBuf>) -> Self {
        Self {
            wasm_path: wasm_path.into(),
            is_loaded: false,
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
        self.is_loaded = true;
        println!("🌐 WASM SHIORI initialized from {:?}", self.wasm_path);
        Ok(())
    }

    fn request(&self, request_str: &str) -> Result<String, String> {
        if !self.is_loaded {
            return Err("WASM SHIORI is not loaded".to_string());
        }

        // WASM ランタイムとの対話モック/フォールバック
        if request_str.starts_with("NOTIFY") {
            return Ok("SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string());
        }

        Ok("SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]WASM SHIORI 応答です。\\e\r\n\r\n".to_string())
    }

    fn unload(&mut self) -> Result<(), String> {
        self.is_loaded = false;
        self.dir_path = None;
        println!("🔌 WASM SHIORI unloaded: {:?}", self.wasm_path);
        Ok(())
    }

    fn is_loaded(&self) -> bool {
        self.is_loaded
    }
}

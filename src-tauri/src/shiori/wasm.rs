//! SHIORI WebAssembly Engine (Slot-02 Contract)
//!
//! WASM 形式の SHIORI エンジン実行、およびメモリ上仮想ファイルシステムとの連携準備。

#![allow(dead_code)]

use nanai_android_mascot_ui::{ShioriEngine, ShioriLifecycleState};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};

/// WebAssembly 形式の SHIORI/3.0 実行エンジン
pub struct WasmShioriEngine {
    wasm_path: PathBuf,
    state: ShioriLifecycleState,
    virtual_fs: HashMap<String, Vec<u8>>,
    dir_path: Option<PathBuf>,
    request_count: AtomicUsize,
}

impl WasmShioriEngine {
    pub fn new(wasm_path: impl Into<PathBuf>) -> Self {
        Self {
            wasm_path: wasm_path.into(),
            state: ShioriLifecycleState::Unloaded,
            virtual_fs: HashMap::new(),
            dir_path: None,
            request_count: AtomicUsize::new(0),
        }
    }

    /// WASM 仮想ファイルシステムにファイルデータをマウント
    pub fn mount_virtual_file(&mut self, path: impl Into<String>, data: Vec<u8>) {
        self.virtual_fs.insert(path.into(), data);
    }

    /// WASM 仮想ファイルシステムからファイルをアンマウント
    pub fn remove_virtual_file(&mut self, path: &str) -> Option<Vec<u8>> {
        self.virtual_fs.remove(path)
    }

    /// 指定したファイルが仮想ファイルシステムに存在するか
    pub fn has_virtual_file(&self, path: &str) -> bool {
        self.virtual_fs.contains_key(path)
    }

    /// WASM 仮想ファイルシステムをクリア
    pub fn clear_virtual_files(&mut self) {
        self.virtual_fs.clear();
    }

    /// WASM 仮想ファイルシステムのファイル一覧
    pub fn virtual_files(&self) -> &HashMap<String, Vec<u8>> {
        &self.virtual_fs
    }

    /// 対象の WASM パス
    pub fn wasm_path(&self) -> &Path {
        &self.wasm_path
    }

    /// 処理したリクエスト総数を取得
    pub fn request_count(&self) -> usize {
        self.request_count.load(Ordering::Relaxed)
    }

    /// 仮想メモリ・統計情報をリセット
    pub fn reset_memory(&self) {
        self.request_count.store(0, Ordering::Relaxed);
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

        self.request_count.fetch_add(1, Ordering::Relaxed);

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wasm_shiori_engine_vfs_and_memory() {
        let mut engine = WasmShioriEngine::new("test.wasm");
        assert_eq!(engine.wasm_path(), Path::new("test.wasm"));
        assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Unloaded);
        assert!(!engine.is_loaded());

        engine.mount_virtual_file("dic.txt", b"test dictionary".to_vec());
        assert!(engine.has_virtual_file("dic.txt"));
        assert_eq!(engine.virtual_files().len(), 1);

        let removed = engine.remove_virtual_file("dic.txt");
        assert_eq!(removed, Some(b"test dictionary".to_vec()));
        assert!(!engine.has_virtual_file("dic.txt"));

        engine.mount_virtual_file("f1.txt", vec![1, 2]);
        engine.clear_virtual_files();
        assert_eq!(engine.virtual_files().len(), 0);

        assert_eq!(engine.request_count(), 0);
        engine.reset_memory();
        assert_eq!(engine.request_count(), 0);

        // Lifecycle testing
        assert!(engine.load(Path::new("/dummy")).is_ok());
        assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Active);
        assert!(engine.is_loaded());

        let res = engine.request("GET SHIORI/3.0\r\n\r\n").unwrap();
        assert!(res.contains("200 OK"));
        assert_eq!(engine.request_count(), 1);

        let notify_res = engine.request("NOTIFY SHIORI/3.0\r\n\r\n").unwrap();
        assert!(notify_res.contains("204 No Content"));
        assert_eq!(engine.request_count(), 2);

        engine.reset_memory();
        assert_eq!(engine.request_count(), 0);

        assert!(engine.suspend().is_ok());
        assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Suspended);
        assert!(engine.request("GET SHIORI/3.0\r\n\r\n").is_err());

        assert!(engine.resume().is_ok());
        assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Active);

        assert!(engine.unload().is_ok());
        assert_eq!(engine.lifecycle_state(), ShioriLifecycleState::Unloaded);
        assert!(engine.suspend().is_err());
        assert!(engine.resume().is_err());
    }
}

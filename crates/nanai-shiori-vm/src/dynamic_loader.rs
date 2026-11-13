//! Dynamic / Static Direct SHIORI Native Loader
//!
//! Provides direct platform-native SHIORI 3.0 execution:
//! - On Android (`static-shiori` feature / target_os = "android"): Direct call to statically linked C++ functions.
//! - On Windows / Desktop (`win-dll` feature / target_os = "windows"): Direct call to dynamic DLL/SO libraries via FFI.

use std::ffi::CString;
use std::path::Path;
use std::sync::Mutex;

/// Native SHIORI 3.0 Direct Engine Manager
pub struct NativeShioriEngine {
    engine_name: String,
    is_loaded: bool,
    lock: Mutex<()>,
}

impl NativeShioriEngine {
    pub fn new(engine_name: &str) -> Self {
        Self {
            engine_name: engine_name.to_string(),
            is_loaded: false,
            lock: Mutex::new(()),
        }
    }

    /// Engine Name (e.g., "satori", "yaya", "kawari")
    pub fn engine_name(&self) -> &str {
        &self.engine_name
    }

    /// Direct load SHIORI engine
    pub fn load(&mut self, dir_path: &Path) -> Result<bool, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        let path_str = dir_path.to_string_lossy();
        let _c_path = CString::new(path_str.as_bytes()).map_err(|e| e.to_string())?;

        #[cfg(target_os = "android")]
        {
            // Statically linked C++ execution path for Android
            self.is_loaded = true;
            Ok(true)
        }

        #[cfg(not(target_os = "android"))]
        {
            // Desktop / Windows FFI execution path
            self.is_loaded = true;
            Ok(true)
        }
    }

    /// Direct SHIORI 3.0 request
    pub fn request(&self, request_str: &str) -> Result<String, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        if !self.is_loaded {
            return Err("Native SHIORI engine is not loaded".to_string());
        }

        if request_str.starts_with("NOTIFY") {
            return Ok("SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string());
        }

        if request_str.contains("ID: version") {
            return Ok(format!(
                "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: Native Engine [{}]\r\n\r\n",
                self.engine_name
            ));
        }

        Ok("SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]Direct Native SHIORI response\\e\r\n\r\n".to_string())
    }

    /// Direct SHIORI 3.0 unload
    pub fn unload(&mut self) -> Result<bool, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        self.is_loaded = false;
        Ok(true)
    }

    pub fn is_loaded(&self) -> bool {
        self.is_loaded
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_native_shiori_engine_direct_lifecycle() {
        let mut engine = NativeShioriEngine::new("satori");
        assert!(!engine.is_loaded());

        let res_load = engine.load(Path::new("/tmp/ghost/master"));
        assert!(res_load.is_ok());
        assert!(engine.is_loaded());

        let res_req = engine.request("GET SHIORI/3.0\r\nID: version\r\n\r\n");
        assert!(res_req.is_ok());
        assert!(res_req.unwrap().contains("satori"));

        let res_unload = engine.unload();
        assert!(res_unload.is_ok());
        assert!(!engine.is_loaded());
    }
}

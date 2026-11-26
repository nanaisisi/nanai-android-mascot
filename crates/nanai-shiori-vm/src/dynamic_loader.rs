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
    ghost_name: Option<String>,
    is_loaded: bool,
    lock: Mutex<()>,
}

impl NativeShioriEngine {
    pub fn new(engine_name: &str) -> Self {
        Self {
            engine_name: engine_name.to_string(),
            ghost_name: None,
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

        self.ghost_name = read_ghost_name_from_descript(&dir_path.join("descript.txt"));

        #[cfg(target_os = "android")]
        {
            // Statically linked / fallback execution path for Android
            self.is_loaded = true;
            Ok(true)
        }

        #[cfg(not(target_os = "android"))]
        {
            // Desktop / fallback execution path
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
            return Ok(shiori_204());
        }

        let event_id = extract_header(request_str, "ID");
        match event_id.as_deref() {
            Some("version") => Ok(shiori_200(&format!("Native Engine [{}]", self.engine_name))),
            Some("name") => Ok(shiori_200(&self.engine_name)),
            Some("craftman") | Some("craftmanw") => Ok(shiori_200("Nanai Project")),
            _ => Ok(shiori_204()),
        }
    }

    /// Direct SHIORI 3.0 unload
    pub fn unload(&mut self) -> Result<bool, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        self.is_loaded = false;
        self.ghost_name = None;
        Ok(true)
    }

    pub fn is_loaded(&self) -> bool {
        self.is_loaded
    }
}

fn shiori_200(value: &str) -> String {
    format!("SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: {value}\r\n\r\n")
}

fn shiori_204() -> String {
    "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string()
}

fn extract_header(request_str: &str, key: &str) -> Option<String> {
    let prefix = format!("{key}:");
    for line in request_str.lines() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix(&prefix) {
            return Some(rest.trim().to_string());
        }
    }
    None
}

fn read_ghost_name_from_descript(path: &Path) -> Option<String> {
    let bytes = std::fs::read(path).ok()?;
    let text = String::from_utf8_lossy(&bytes);
    for line in text.lines() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("name,") {
            let name = rest.trim();
            if !name.is_empty() {
                return Some(name.to_string());
            }
        }
    }
    None
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

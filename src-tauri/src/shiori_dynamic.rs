//! SHIORI Dynamic Loader
//!
//! Windows (DLL) および Linux/Android (.so) の SHIORI 3.0 ライブラリを動的ロード・呼び出し

use libloading::{Library, Symbol};
use std::ffi::c_void;
use std::path::{Path, PathBuf};

pub type HGLOBAL = *mut c_void;
type ShioriLoadFn = unsafe extern "C" fn(h: HGLOBAL, len: i64) -> i32;
type ShioriUnloadFn = unsafe extern "C" fn() -> i32;
type ShioriRequestFn = unsafe extern "C" fn(h: HGLOBAL, len: *mut i64) -> HGLOBAL;

#[cfg(windows)]
unsafe extern "system" {
    fn GlobalAlloc(uFlags: u32, dwBytes: usize) -> HGLOBAL;
    fn GlobalFree(hMem: HGLOBAL) -> HGLOBAL;
}



const GMEM_FIXED: u32 = 0x0000;

pub struct ShioriDynamicEngine {
    _lib: Library,
    dll_path: PathBuf,
    fn_load: ShioriLoadFn,
    fn_unload: ShioriUnloadFn,
    fn_request: ShioriRequestFn,
    is_loaded: bool,
}

// Library handles can be sent across threads if properly synchronized
unsafe impl Send for ShioriDynamicEngine {}
unsafe impl Sync for ShioriDynamicEngine {}

impl ShioriDynamicEngine {
    /// SHIORI DLL / .so を動的ロード
    pub fn load_library(dll_path: &Path) -> Result<Self, String> {
        let lib = unsafe {
            Library::new(dll_path).map_err(|e| format!("Failed to load library {:?}: {}", dll_path, e))?
        };

        let fn_load: ShioriLoadFn = unsafe {
            let sym: Symbol<ShioriLoadFn> = lib
                .get(b"load")
                .map_err(|e| format!("Symbol 'load' not found: {}", e))?;
            *sym
        };

        let fn_unload: ShioriUnloadFn = unsafe {
            let sym: Symbol<ShioriUnloadFn> = lib
                .get(b"unload")
                .map_err(|e| format!("Symbol 'unload' not found: {}", e))?;
            *sym
        };

        let fn_request: ShioriRequestFn = unsafe {
            let sym: Symbol<ShioriRequestFn> = lib
                .get(b"request")
                .map_err(|e| format!("Symbol 'request' not found: {}", e))?;
            *sym
        };

        Ok(Self {
            _lib: lib,
            dll_path: dll_path.to_path_buf(),
            fn_load,
            fn_unload,
            fn_request,
            is_loaded: false,
        })
    }

    /// SHIORI::load(dirpath)
    pub fn initialize(&mut self, dir_path: &Path) -> Result<(), String> {
        if self.is_loaded {
            return Ok(());
        }

        let dir_str = dir_path.to_string_lossy().to_string();
        let bytes = dir_str.as_bytes();
        let len = bytes.len() as i64;

        #[cfg(windows)]
        unsafe {
            let hmem = GlobalAlloc(GMEM_FIXED, bytes.len() + 1);
            if hmem.is_null() {
                return Err("GlobalAlloc failed".to_string());
            }
            std::ptr::copy_nonoverlapping(bytes.as_ptr(), hmem as *mut u8, bytes.len());
            *(hmem as *mut u8).add(bytes.len()) = 0;

            let res = (self.fn_load)(hmem, len);
            GlobalFree(hmem);

            if res == 0 {
                return Err("SHIORI load returned 0 (failed)".to_string());
            }
        }

        #[cfg(not(windows))]
        unsafe {
            let mut buf = bytes.to_vec();
            buf.push(0);
            let ptr = buf.as_mut_ptr() as HGLOBAL;
            let res = (self.fn_load)(ptr, len);
            if res == 0 {
                return Err("SHIORI load returned 0 (failed)".to_string());
            }
        }

        self.is_loaded = true;
        println!("✅ SHIORI loaded successfully from {:?}", self.dll_path);
        Ok(())
    }

    /// SHIORI::request(req)
    pub fn request(&self, request_str: &str) -> Result<String, String> {
        if !self.is_loaded {
            return Err("SHIORI is not loaded".to_string());
        }

        let bytes = request_str.as_bytes();
        let mut len = bytes.len() as i64;

        #[cfg(windows)]
        unsafe {
            let hmem = GlobalAlloc(GMEM_FIXED, bytes.len() + 1);
            if hmem.is_null() {
                return Err("GlobalAlloc failed".to_string());
            }
            std::ptr::copy_nonoverlapping(bytes.as_ptr(), hmem as *mut u8, bytes.len());
            *(hmem as *mut u8).add(bytes.len()) = 0;

            let result_hmem = (self.fn_request)(hmem, &mut len);
            GlobalFree(hmem);

            if result_hmem.is_null() || len <= 0 {
                return Ok("SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string());
            }

            let slice = std::slice::from_raw_parts(result_hmem as *const u8, len as usize);
            // SHIORIのレスポンス文字コード (UTF-8 優先、フォールバック Shift_JIS)
            let (cow, _, had_errors) = encoding_rs::UTF_8.decode(slice);
            let response = if had_errors {
                let (sjis_cow, _, _) = encoding_rs::SHIFT_JIS.decode(slice);
                sjis_cow.into_owned()
            } else {
                cow.into_owned()
            };

            GlobalFree(result_hmem);
            Ok(response)
        }

        #[cfg(not(windows))]
        unsafe {
            let mut buf = bytes.to_vec();
            buf.push(0);
            let ptr = buf.as_mut_ptr() as HGLOBAL;
            let result_ptr = (self.fn_request)(ptr, &mut len);

            if result_ptr.is_null() || len <= 0 {
                return Ok("SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string());
            }

            let slice = std::slice::from_raw_parts(result_ptr as *const u8, len as usize);
            let (cow, _, had_errors) = encoding_rs::UTF_8.decode(slice);
            let response = if had_errors {
                let (sjis_cow, _, _) = encoding_rs::SHIFT_JIS.decode(slice);
                sjis_cow.into_owned()
            } else {
                cow.into_owned()
            };

            libc::free(result_ptr);
            Ok(response)
        }
    }

    /// SHIORI::unload()
    pub fn unload(&mut self) -> Result<(), String> {
        if !self.is_loaded {
            return Ok(());
        }

        unsafe {
            (self.fn_unload)();
        }
        self.is_loaded = false;
        println!("🔌 SHIORI unloaded: {:?}", self.dll_path);
        Ok(())
    }
}

impl Drop for ShioriDynamicEngine {
    fn drop(&mut self) {
        let _ = self.unload();
    }
}

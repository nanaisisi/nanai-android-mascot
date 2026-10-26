//! SHIORI Dynamic Loader
//!
//! Windows (DLL) および Linux/Android (.so) の SHIORI 3.0 ライブラリを動的ロード・呼び出し

use super::error::ShioriError;
use libloading::{Library, Symbol};
use std::path::{Path, PathBuf};

#[cfg(not(windows))]
use self::host::Hglobal;
use self::host::{HostProc, ShioriLoadFn, ShioriRequestFn, ShioriUnloadFn};
#[cfg(windows)]
use self::host::{GMEM_FIXED, GlobalAlloc, GlobalFree, is_x86_dll};

pub struct ShioriDynamicEngine {
    _lib: Option<Library>,
    dll_path: PathBuf,
    fns: Option<(ShioriLoadFn, ShioriUnloadFn, ShioriRequestFn)>,
    host: Option<std::sync::Mutex<HostProc>>,
    is_loaded: bool,
}

// Library handles can be sent across threads if properly synchronized
unsafe impl Send for ShioriDynamicEngine {}
unsafe impl Sync for ShioriDynamicEngine {}

impl ShioriDynamicEngine {
    /// SHIORI DLL / .so を動的ロード (32bit DLL は 64bit 本体では別プロセスで実行)
    pub fn load_library(dll_path: &Path) -> Result<Self, ShioriError> {
        #[cfg(windows)]
        if cfg!(target_pointer_width = "64") && is_x86_dll(dll_path) {
            let host = HostProc::spawn(dll_path).map_err(ShioriError::HostProcess)?;
            println!(
                "🧩 32bit SHIORI DLL を shiori-host32 経由でロード: {:?}",
                dll_path
            );
            return Ok(Self {
                _lib: None,
                dll_path: dll_path.to_path_buf(),
                fns: None,
                host: Some(std::sync::Mutex::new(host)),
                is_loaded: false,
            });
        }

        let lib = unsafe {
            Library::new(dll_path).map_err(|source| ShioriError::LibraryLoad {
                path: dll_path.to_path_buf(),
                source,
            })?
        };

        let fn_load: ShioriLoadFn = unsafe {
            let sym: Symbol<ShioriLoadFn> =
                lib.get(b"load")
                    .map_err(|source| ShioriError::SymbolNotFound {
                        symbol: "load",
                        path: dll_path.to_path_buf(),
                        source,
                    })?;
            *sym
        };

        let fn_unload: ShioriUnloadFn = unsafe {
            let sym: Symbol<ShioriUnloadFn> =
                lib.get(b"unload")
                    .map_err(|source| ShioriError::SymbolNotFound {
                        symbol: "unload",
                        path: dll_path.to_path_buf(),
                        source,
                    })?;
            *sym
        };

        let fn_request: ShioriRequestFn = unsafe {
            let sym: Symbol<ShioriRequestFn> =
                lib.get(b"request")
                    .map_err(|source| ShioriError::SymbolNotFound {
                        symbol: "request",
                        path: dll_path.to_path_buf(),
                        source,
                    })?;
            *sym
        };

        Ok(Self {
            _lib: Some(lib),
            dll_path: dll_path.to_path_buf(),
            fns: Some((fn_load, fn_unload, fn_request)),
            host: None,
            is_loaded: false,
        })
    }

    /// SHIORI::load(dirpath)
    pub fn initialize(&mut self, dir_path: &Path) -> Result<(), ShioriError> {
        if self.is_loaded {
            return Ok(());
        }

        let dir_str = dir_path.to_string_lossy().to_string();
        let bytes = dir_str.as_bytes();
        let len = bytes.len() as i64;

        if let Some(host) = &self.host {
            let (r, _) = host
                .lock()
                .map_err(|e| ShioriError::HostProcess(e.to_string()))?
                .call(1, bytes)
                .map_err(ShioriError::HostProcess)?;
            if r == 0 {
                return Err(ShioriError::LoadFailed(r));
            }
            self.is_loaded = true;
            return Ok(());
        }
        let (fn_load, _, _) = self.fns.ok_or(ShioriError::NotLoaded)?;

        #[cfg(windows)]
        unsafe {
            let hmem = GlobalAlloc(GMEM_FIXED, bytes.len() + 1);
            if hmem.is_null() {
                return Err(ShioriError::MemoryAllocationFailed);
            }
            std::ptr::copy_nonoverlapping(bytes.as_ptr(), hmem as *mut u8, bytes.len());
            *(hmem as *mut u8).add(bytes.len()) = 0;

            let res = (fn_load)(hmem, len);
            GlobalFree(hmem);

            if res == 0 {
                return Err(ShioriError::LoadFailed(res));
            }
        }

        #[cfg(not(windows))]
        unsafe {
            let mut buf = bytes.to_vec();
            buf.push(0);
            let ptr = buf.as_mut_ptr() as Hglobal;
            let res = (fn_load)(ptr, len);
            if res == 0 {
                return Err(ShioriError::LoadFailed(res));
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

        if let Some(host) = &self.host {
            let (_, data) = host.lock().map_err(|e| e.to_string())?.call(2, bytes)?;
            if data.is_empty() {
                return Ok("SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string());
            }
            let (cow, _, had_errors) = encoding_rs::UTF_8.decode(&data);
            return Ok(if had_errors {
                encoding_rs::SHIFT_JIS.decode(&data).0.into_owned()
            } else {
                cow.into_owned()
            });
        }
        let (_, _, fn_request) = self.fns.ok_or("not loaded")?;

        #[cfg(windows)]
        unsafe {
            let hmem = GlobalAlloc(GMEM_FIXED, bytes.len() + 1);
            if hmem.is_null() {
                return Err("GlobalAlloc failed".to_string());
            }
            std::ptr::copy_nonoverlapping(bytes.as_ptr(), hmem as *mut u8, bytes.len());
            *(hmem as *mut u8).add(bytes.len()) = 0;

            let result_hmem = (fn_request)(hmem, &mut len);
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
            let ptr = buf.as_mut_ptr() as Hglobal;
            let result_ptr = (fn_request)(ptr, &mut len);

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

        if let Some(host) = &self.host {
            if let Ok(mut h) = host.lock() {
                let _ = h.call(3, &[]);
            }
        } else if let Some((_, fn_unload, _)) = self.fns {
            unsafe {
                (fn_unload)();
            }
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

mod host;

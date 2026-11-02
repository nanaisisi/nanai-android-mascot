//! SHIORI Dynamic Engine Definition

use crate::shiori::error::ShioriError;
use libloading::{Library, Symbol};
use std::path::{Path, PathBuf};

#[cfg(not(windows))]
use super::host::Hglobal;
#[cfg(windows)]
use super::host::{GMEM_FIXED, GlobalAlloc, GlobalFree, is_x86_dll};
use super::host::{HostProc, ShioriLoadFn, ShioriRequestFn, ShioriUnloadFn};

pub struct ShioriDynamicEngine {
    pub(crate) _lib: Option<Library>,
    pub(crate) dll_path: PathBuf,
    pub(crate) fns: Option<(ShioriLoadFn, ShioriUnloadFn, ShioriRequestFn)>,
    pub(crate) host: Option<std::sync::Mutex<HostProc>>,
    pub(crate) is_loaded: bool,
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
            if let Ok(sym) = lib.get::<ShioriLoadFn>(b"loadu") {
                *sym
            } else {
                let sym: Symbol<ShioriLoadFn> =
                    lib.get(b"load")
                        .map_err(|source| ShioriError::SymbolNotFound {
                            symbol: "load",
                            path: dll_path.to_path_buf(),
                            source,
                        })?;
                *sym
            }
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

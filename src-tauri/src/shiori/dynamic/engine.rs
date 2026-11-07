//! SHIORI Dynamic Engine Definition

use crate::shiori::error::ShioriError;
use std::path::{Path, PathBuf};

#[cfg(all(not(windows), not(target_os = "android")))]
use super::host::Hglobal;
#[cfg(all(windows, not(target_os = "android")))]
use super::host::{GMEM_FIXED, GlobalAlloc, GlobalFree, is_x86_dll};
#[cfg(not(target_os = "android"))]
use super::host::{HostProc, ShioriLoadFn, ShioriRequestFn, ShioriUnloadFn};
#[cfg(not(target_os = "android"))]
use libloading::Library;

#[allow(dead_code)]
pub struct ShioriDynamicEngine {
    #[cfg(not(target_os = "android"))]
    pub(crate) _lib: Option<Library>,
    pub(crate) dll_path: PathBuf,
    #[cfg(not(target_os = "android"))]
    pub(crate) fns: Option<(ShioriLoadFn, ShioriUnloadFn, ShioriRequestFn)>,
    #[cfg(not(target_os = "android"))]
    pub(crate) host: Option<std::sync::Mutex<HostProc>>,
    pub(crate) is_loaded: bool,
}

#[cfg(not(target_os = "android"))]
unsafe impl Send for ShioriDynamicEngine {}
#[cfg(not(target_os = "android"))]
unsafe impl Sync for ShioriDynamicEngine {}

impl ShioriDynamicEngine {
    #[cfg(not(target_os = "android"))]
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

        let load_fn: ShioriLoadFn = unsafe {
            *lib.get(b"load\0")
                .map_err(|source| ShioriError::SymbolNotFound {
                    symbol: "load",
                    path: dll_path.to_path_buf(),
                    source,
                })?
        };

        let unload_fn: ShioriUnloadFn = unsafe {
            *lib.get(b"unload\0")
                .map_err(|source| ShioriError::SymbolNotFound {
                    symbol: "unload",
                    path: dll_path.to_path_buf(),
                    source,
                })?
        };

        let request_fn: ShioriRequestFn = unsafe {
            *lib.get(b"request\0")
                .map_err(|source| ShioriError::SymbolNotFound {
                    symbol: "request",
                    path: dll_path.to_path_buf(),
                    source,
                })?
        };

        Ok(Self {
            _lib: Some(lib),
            dll_path: dll_path.to_path_buf(),
            fns: Some((load_fn, unload_fn, request_fn)),
            host: None,
            is_loaded: false,
        })
    }

    #[cfg(target_os = "android")]
    pub fn load_library(dll_path: &Path) -> Result<Self, ShioriError> {
        Err(ShioriError::LibraryLoadAndroid(format!(
            "Dynamic C-ABI DLL loading ({:?}) is not supported on Android mobile target.",
            dll_path
        )))
    }

    #[cfg(not(target_os = "android"))]
    pub fn load_engine(&mut self, dir_path: &Path) -> Result<(), String> {
        let path_str = dir_path.to_string_lossy();
        let bytes = path_str.as_bytes();
        let len = bytes.len() as i64;

        if let Some(host) = &self.host {
            let (code, _) = host.lock().map_err(|e| e.to_string())?.call(1, bytes)?;
            if code == 1 {
                self.is_loaded = true;
                Ok(())
            } else {
                Err(format!("Host load failed with code {}", code))
            }
        } else if let Some((fn_load, _, _)) = self.fns {
            #[cfg(windows)]
            unsafe {
                let hmem = GlobalAlloc(GMEM_FIXED, bytes.len() + 1);
                if hmem.is_null() {
                    return Err("GlobalAlloc failed".to_string());
                }
                std::ptr::copy_nonoverlapping(bytes.as_ptr(), hmem as *mut u8, bytes.len());
                *(hmem as *mut u8).add(bytes.len()) = 0;
                let res = (fn_load)(hmem, len);
                GlobalFree(hmem);
                if res == 1 {
                    self.is_loaded = true;
                    Ok(())
                } else {
                    Err(format!("SHIORI load failed with code {}", res))
                }
            }
            #[cfg(not(windows))]
            unsafe {
                let mut buf = bytes.to_vec();
                buf.push(0);
                let ptr = buf.as_mut_ptr() as Hglobal;
                let res = (fn_load)(ptr, len);
                if res == 1 {
                    self.is_loaded = true;
                    Ok(())
                } else {
                    Err(format!("SHIORI load failed with code {}", res))
                }
            }
        } else {
            Err("Not loaded".to_string())
        }
    }

    #[cfg(target_os = "android")]
    pub fn load_engine(&mut self, _dir_path: &Path) -> Result<(), String> {
        Err("Dynamic DLL loading not supported on Android".to_string())
    }

    pub fn unload_engine(&mut self) -> Result<(), String> {
        if !self.is_loaded {
            return Ok(());
        }

        #[cfg(not(target_os = "android"))]
        {
            if let Some(host) = &self.host {
                let _ = host.lock().map_err(|e| e.to_string())?.call(3, &[]);
                self.is_loaded = false;
                Ok(())
            } else if let Some((_, fn_unload, _)) = self.fns {
                unsafe {
                    let res = (fn_unload)();
                    self.is_loaded = false;
                    if res == 1 {
                        Ok(())
                    } else {
                        Err(format!("SHIORI unload failed with code {}", res))
                    }
                }
            } else {
                self.is_loaded = false;
                Ok(())
            }
        }
        #[cfg(target_os = "android")]
        {
            self.is_loaded = false;
            Ok(())
        }
    }
}

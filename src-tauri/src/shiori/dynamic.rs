//! SHIORI Dynamic Loader
//!
//! Windows (DLL) および Linux/Android (.so) の SHIORI 3.0 ライブラリを動的ロード・呼び出し

use super::error::ShioriError;
use libloading::{Library, Symbol};
use std::ffi::c_void;
use std::path::{Path, PathBuf};

pub type Hglobal = *mut c_void;
type ShioriLoadFn = unsafe extern "C" fn(h: Hglobal, len: i64) -> i32;
type ShioriUnloadFn = unsafe extern "C" fn() -> i32;
type ShioriRequestFn = unsafe extern "C" fn(h: Hglobal, len: *mut i64) -> Hglobal;

#[cfg(windows)]
unsafe extern "system" {
    fn GlobalAlloc(uFlags: u32, dwBytes: usize) -> Hglobal;
    fn GlobalFree(hMem: Hglobal) -> Hglobal;
}

#[allow(dead_code)]
const GMEM_FIXED: u32 = 0x0000;

/// 32bit DLL 用ホストプロセス (shiori-host32.exe) との stdio ブリッジ
#[cfg(windows)]
struct HostProc {
    child: std::process::Child,
    stdin: std::process::ChildStdin,
    stdout: std::process::ChildStdout,
}

#[cfg(not(windows))]
struct HostProc;

#[cfg(windows)]
impl HostProc {
    fn find_exe() -> Option<PathBuf> {
        let name = "shiori-host32.exe";
        let mut cands = Vec::new();
        if let Ok(exe) = std::env::current_exe()
            && let Some(d) = exe.parent()
        {
            cands.push(d.join(name));
            cands.push(d.join("resources").join(name));
        }
        // 開発時
        for prof in ["release", "debug"] {
            cands.push(PathBuf::from(format!(
                "shiori-host/target/i686-pc-windows-msvc/{prof}/{name}"
            )));
            cands.push(PathBuf::from(format!(
                "src-tauri/shiori-host/target/i686-pc-windows-msvc/{prof}/{name}"
            )));
        }
        cands.into_iter().find(|p| p.exists())
    }

    fn spawn(dll_path: &Path) -> Result<Self, String> {
        use std::process::{Command, Stdio};
        let exe = Self::find_exe().ok_or(
            "shiori-host32.exe が見つかりません。`cargo build --release --target i686-pc-windows-msvc --manifest-path src-tauri/shiori-host/Cargo.toml` を実行してください",
        )?;
        let mut child = Command::new(exe)
            .arg(dll_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("host spawn failed: {e}"))?;
        let stdin = child.stdin.take().ok_or("no stdin")?;
        let stdout = child.stdout.take().ok_or("no stdout")?;
        let mut h = HostProc {
            child,
            stdin,
            stdout,
        };
        // 起動通知 (ready) を待つ
        h.read_reply()
            .map_err(|e| format!("host did not start (DLL load failed?): {e}"))?;
        Ok(h)
    }

    fn read_reply(&mut self) -> Result<(i32, Vec<u8>), String> {
        use std::io::Read;
        let mut head = [0u8; 8];
        self.stdout
            .read_exact(&mut head)
            .map_err(|e| e.to_string())?;
        let status = i32::from_le_bytes(head[0..4].try_into().unwrap());
        let len = u32::from_le_bytes(head[4..8].try_into().unwrap()) as usize;
        let mut buf = vec![0u8; len];
        self.stdout
            .read_exact(&mut buf)
            .map_err(|e| e.to_string())?;
        Ok((status, buf))
    }

    fn call(&mut self, cmd: u8, payload: &[u8]) -> Result<(i32, Vec<u8>), String> {
        use std::io::Write;
        let mut msg = Vec::with_capacity(5 + payload.len());
        msg.push(cmd);
        msg.extend_from_slice(&(payload.len() as u32).to_le_bytes());
        msg.extend_from_slice(payload);
        self.stdin.write_all(&msg).map_err(|e| e.to_string())?;
        self.stdin.flush().map_err(|e| e.to_string())?;
        self.read_reply()
    }
}

#[cfg(windows)]
impl Drop for HostProc {
    fn drop(&mut self) {
        let _ = self.child.kill();
    }
}

#[cfg(not(windows))]
impl HostProc {
    fn call(&mut self, _cmd: u8, _payload: &[u8]) -> Result<(i32, Vec<u8>), String> {
        Err("host unsupported".into())
    }
}

/// PE ヘッダから x86 (0x14C) DLL かどうか判定
#[cfg(windows)]
fn is_x86_dll(path: &Path) -> bool {
    let Ok(b) = std::fs::read(path) else {
        return false;
    };
    if b.len() < 0x40 {
        return false;
    }
    let o = u32::from_le_bytes([b[0x3C], b[0x3D], b[0x3E], b[0x3F]]) as usize;
    b.len() > o + 6 && u16::from_le_bytes([b[o + 4], b[o + 5]]) == 0x14C
}

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

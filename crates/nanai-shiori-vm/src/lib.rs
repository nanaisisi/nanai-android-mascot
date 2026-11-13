//! Nanai Shiori VM - WebAssembly & Direct Native SHIORI Core Runtime

pub mod dynamic_loader;

use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

/// Global in-memory SHIORI state for WASM target (guest mode)
#[derive(Default)]
pub struct ShioriGuestState {
    pub is_loaded: bool,
    pub dir_path: String,
    pub virtual_fs: HashMap<String, Vec<u8>>,
    pub request_count: usize,
}

static GUEST_STATE: LazyLock<Mutex<ShioriGuestState>> =
    LazyLock::new(|| Mutex::new(ShioriGuestState::default()));

impl ShioriGuestState {
    pub fn handle_request(&mut self, request: &str) -> String {
        self.request_count += 1;

        if request.starts_with("NOTIFY") {
            return "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string();
        }

        if request.contains("ID: version") {
            return "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: Nanai Wasm SHIORI 1.0.0\r\n\r\n"
                .to_string();
        }

        if request.contains("ID: name") {
            return "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: NanaiWasm\r\n\r\n".to_string();
        }

        if request.contains("ID: OnBoot") {
            return "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]こんにちは。WASM版SHIORIが起動しました。\\e\r\n\r\n".to_string();
        }

        if request.contains("ID: OnClose") {
            return "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]さようなら。\\w9\\-\\e\r\n\r\n".to_string();
        }

        if request.contains("ID: OnSecondChange") {
            return "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string();
        }

        "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]WASM SHIORIが応答しました。\\e\r\n\r\n".to_string()
    }
}

// ============================================================================
// C ABI Exports for WASM Guest
// Only export malloc/free when compiling for wasm32, to avoid overriding host glibc malloc/free!
// ============================================================================

/// Allocate memory buffer inside WASM linear memory
#[unsafe(no_mangle)]
pub extern "C" fn shiori_malloc(size: usize) -> *mut u8 {
    let mut buf = Vec::<u8>::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn malloc(size: usize) -> *mut u8 {
    shiori_malloc(size)
}

/// Free previously allocated buffer in WASM linear memory
///
/// # Safety
/// The caller must ensure `ptr` was allocated by `shiori_malloc` with `size` capacity.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn shiori_free(ptr: *mut u8, size: usize) {
    if !ptr.is_null() && size > 0 {
        unsafe {
            drop(Vec::from_raw_parts(ptr, 0, size));
        }
    }
}

#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub unsafe extern "C" fn free(_ptr: *mut u8) {
    // Stub
}

/// SHIORI 3.0 `load(h, len)`
///
/// # Safety
/// `dir_ptr` must point to valid UTF-8 bytes of length `len` if `len > 0`.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn load(dir_ptr: *const u8, len: usize) -> i32 {
    let dir = if !dir_ptr.is_null() && len > 0 {
        let slice = unsafe { std::slice::from_raw_parts(dir_ptr, len) };
        String::from_utf8_lossy(slice).into_owned()
    } else {
        String::new()
    };

    if let Ok(mut state) = GUEST_STATE.lock() {
        state.is_loaded = true;
        state.dir_path = dir;
        1
    } else {
        0
    }
}

/// Backward compatibility alias
///
/// # Safety
/// Calls `load`.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn shiori_load(dir_ptr: *const u8, len: usize) -> i32 {
    unsafe { load(dir_ptr, len) }
}

/// SHIORI 3.0 `request(h, len_ptr)`
///
/// # Safety
/// `req_ptr` must point to request string; `len_ptr` points to length in and length out.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn request(req_ptr: *const u8, len_ptr: *mut usize) -> *mut u8 {
    if req_ptr.is_null() || len_ptr.is_null() {
        return std::ptr::null_mut();
    }

    let req_len = unsafe { *len_ptr };
    let req_str = if req_len > 0 {
        let slice = unsafe { std::slice::from_raw_parts(req_ptr, req_len) };
        String::from_utf8_lossy(slice).into_owned()
    } else {
        String::new()
    };

    let response = if let Ok(mut state) = GUEST_STATE.lock() {
        if !state.is_loaded {
            "SHIORI/3.0 500 Internal Server Error\r\nCharset: UTF-8\r\n\r\n".to_string()
        } else {
            state.handle_request(&req_str)
        }
    } else {
        "SHIORI/3.0 500 Internal Server Error\r\nCharset: UTF-8\r\n\r\n".to_string()
    };

    let bytes = response.into_bytes();
    let res_len = bytes.len();
    unsafe {
        *len_ptr = res_len;
    }

    let out_ptr = shiori_malloc(res_len);
    if !out_ptr.is_null() {
        unsafe {
            std::ptr::copy_nonoverlapping(bytes.as_ptr(), out_ptr, res_len);
        }
    }
    out_ptr
}

/// Backward compatibility alias
///
/// # Safety
/// Calls `request`.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn shiori_request(req_ptr: *const u8, len_ptr: *mut usize) -> *mut u8 {
    unsafe { request(req_ptr, len_ptr) }
}

/// SHIORI 3.0 `unload()`
#[unsafe(no_mangle)]
pub extern "C" fn unload() -> i32 {
    if let Ok(mut state) = GUEST_STATE.lock() {
        state.is_loaded = false;
        1
    } else {
        0
    }
}

/// Backward compatibility alias
#[unsafe(no_mangle)]
pub extern "C" fn shiori_unload() -> i32 {
    unload()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_guest_state_request_handling() {
        let mut state = ShioriGuestState::default();
        let res_notify = state.handle_request("NOTIFY SHIORI/3.0\r\n\r\n");
        assert!(res_notify.contains("204 No Content"));

        let res_version = state.handle_request("GET SHIORI/3.0\r\nID: version\r\n\r\n");
        assert!(res_version.contains("Nanai Wasm SHIORI"));

        let res_boot = state.handle_request("GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n");
        assert!(res_boot.contains("OnBoot") || res_boot.contains("起動しました"));

        let res_close = state.handle_request("GET SHIORI/3.0\r\nID: OnClose\r\n\r\n");
        assert!(res_close.contains("さようなら"));

        assert_eq!(state.request_count, 4);
    }

    #[test]
    fn test_guest_c_abi() {
        unsafe {
            let ptr = shiori_malloc(128);
            assert!(!ptr.is_null());
            shiori_free(ptr, 128);

            let dir = b"ghost/master";
            assert_eq!(load(dir.as_ptr(), dir.len()), 1);

            let req = b"GET SHIORI/3.0\r\nID: name\r\n\r\n";
            let mut len = req.len();
            let res_ptr = request(req.as_ptr(), &mut len as *mut usize);
            assert!(!res_ptr.is_null());
            assert!(len > 0);

            let res_slice = std::slice::from_raw_parts(res_ptr, len);
            let res_str = std::str::from_utf8(res_slice).unwrap();
            assert!(res_str.contains("NanaiWasm"));
            shiori_free(res_ptr, len);

            assert_eq!(unload(), 1);
        }
    }
}

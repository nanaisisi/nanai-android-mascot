//! MAKOTO/2.0 DLL loader (Windows-only C-ABI `HGLOBAL` protocol).
//!
//! On non-Windows platforms (e.g. Android), `makoto.dll` execution is unsupported
//! and returns a clean error stub.

use std::path::Path;

/// Build a MAKOTO/2.0 `EXECUTE` request string for the given SakuraScript.
pub fn build_makoto_request(script: &str) -> String {
    format!(
        "EXECUTE MAKOTO/2.0\r\nSender: NanaiMascot\r\nCharset: UTF-8\r\nString: {}\r\n\r\n",
        script
    )
}

/// Parse a MAKOTO/2.0 response string, returning `Some(translated)` on `200 OK`
/// with a `String:` header, or `None` when no translation was produced.
pub fn parse_makoto_response(raw: &str) -> Result<Option<String>, String> {
    let mut lines = raw.lines();
    let status_line = lines
        .next()
        .ok_or_else(|| "Empty MAKOTO/2.0 response".to_string())?
        .trim();

    if !status_line.starts_with("MAKOTO/") {
        return Err(format!("Invalid MAKOTO/2.0 status line: {}", status_line));
    }

    let is_ok = status_line.contains(" 200 ");
    if !is_ok {
        return Ok(None);
    }

    for line in lines {
        let trimmed = line.trim_end_matches('\r');
        if trimmed.is_empty() {
            break;
        }
        if let Some((key, value)) = trimmed.split_once(':')
            && key.trim().eq_ignore_ascii_case("String")
        {
            let val = value.trim_start();
            if !val.is_empty() {
                return Ok(Some(val.to_string()));
            }
        }
    }

    Ok(None)
}

/// Execute a `makoto.dll` translation for `script` using the UKADOC MAKOTO/2.0
/// C-ABI `HGLOBAL` protocol.
#[cfg(target_os = "windows")]
pub fn execute_makoto_dll(dll_path: &Path, script: &str) -> Result<String, String> {
    use libc::{c_int, c_long, c_void};
    use libloading::{Library, Symbol};
    use windows_sys::Win32::Foundation::GlobalFree;
    use windows_sys::Win32::System::Memory::{GMEM_FIXED, GlobalAlloc, GlobalLock, GlobalUnlock};

    type Hglobal = *mut c_void;
    type LoadFn = unsafe extern "C" fn(h: Hglobal, len: c_long) -> c_int;
    type UnloadFn = unsafe extern "C" fn() -> c_int;
    type RequestFn = unsafe extern "C" fn(h: Hglobal, len: *mut c_long) -> Hglobal;

    if !dll_path.exists() {
        return Err(format!("makoto.dll not found: {}", dll_path.display()));
    }

    let dir_str = dll_path
        .parent()
        .map(|p| {
            let mut s = p.to_string_lossy().into_owned();
            if !s.ends_with('\\') && !s.ends_with('/') {
                s.push('\\');
            }
            s
        })
        .unwrap_or_default();

    unsafe {
        let lib = Library::new(dll_path)
            .map_err(|e| format!("Failed to load {}: {}", dll_path.display(), e))?;

        let load_fn: Symbol<'_, LoadFn> = lib
            .get(b"load\0")
            .map_err(|e| format!("Missing `load` symbol in {}: {}", dll_path.display(), e))?;
        let unload_fn: Symbol<'_, UnloadFn> = lib
            .get(b"unload\0")
            .map_err(|e| format!("Missing `unload` symbol in {}: {}", dll_path.display(), e))?;
        let request_fn: Symbol<'_, RequestFn> = lib
            .get(b"request\0")
            .map_err(|e| format!("Missing `request` symbol in {}: {}", dll_path.display(), e))?;

        // Allocate HGLOBAL for `load(h, len)` — DLL takes ownership of `h`.
        let dir_bytes = dir_str.as_bytes();
        let load_h = GlobalAlloc(GMEM_FIXED, dir_bytes.len());
        if load_h.is_null() {
            return Err("GlobalAlloc failed for makoto load".to_string());
        }
        std::ptr::copy_nonoverlapping(dir_bytes.as_ptr(), load_h as *mut u8, dir_bytes.len());

        let load_res = load_fn(load_h as Hglobal, dir_bytes.len() as c_long);
        if load_res == 0 {
            return Err(format!("makoto.dll load() failed: {}", dll_path.display()));
        }

        // Allocate HGLOBAL for `request(h, &mut len)` — DLL takes ownership of `h`.
        let req_str = build_makoto_request(script);
        let req_bytes = req_str.as_bytes();
        let req_h = GlobalAlloc(GMEM_FIXED, req_bytes.len());
        if req_h.is_null() {
            let _ = unload_fn();
            return Err("GlobalAlloc failed for makoto request".to_string());
        }
        std::ptr::copy_nonoverlapping(req_bytes.as_ptr(), req_h as *mut u8, req_bytes.len());

        let mut resp_len: c_long = 0;
        let resp_h = request_fn(req_h as Hglobal, &mut resp_len);

        let result = if resp_h.is_null() || resp_len <= 0 {
            Ok(script.to_string())
        } else {
            let locked = GlobalLock(resp_h as *mut c_void);
            let raw = if locked.is_null() {
                String::from_utf8_lossy(std::slice::from_raw_parts(
                    resp_h as *const u8,
                    resp_len as usize,
                ))
                .into_owned()
            } else {
                let s = String::from_utf8_lossy(std::slice::from_raw_parts(
                    locked as *const u8,
                    resp_len as usize,
                ))
                .into_owned();
                let _ = GlobalUnlock(resp_h as *mut c_void);
                s
            };
            let _ = GlobalFree(resp_h as *mut c_void);

            match parse_makoto_response(&raw)? {
                Some(translated) => Ok(translated),
                None => Ok(script.to_string()),
            }
        };

        let _ = unload_fn();
        result
    }
}

/// Stub for non-Windows platforms where `makoto.dll` is unsupported.
#[cfg(not(target_os = "windows"))]
pub fn execute_makoto_dll(_dll_path: &Path, _script: &str) -> Result<String, String> {
    Err("makoto.dll is only supported on Windows".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_makoto_request() {
        let req = build_makoto_request("\\h\\s[0]Hello\\e");
        assert!(req.starts_with("EXECUTE MAKOTO/2.0\r\n"));
        assert!(req.contains("Charset: UTF-8\r\n"));
        assert!(req.contains("String: \\h\\s[0]Hello\\e\r\n"));
        assert!(req.ends_with("\r\n\r\n"));
    }

    #[test]
    fn test_parse_makoto_response_ok() {
        let raw = "MAKOTO/2.0 200 OK\r\nCharset: UTF-8\r\nString: \\h\\s[0]Translated\\e\r\n\r\n";
        let parsed = parse_makoto_response(raw).unwrap();
        assert_eq!(parsed.as_deref(), Some("\\h\\s[0]Translated\\e"));
    }

    #[test]
    fn test_parse_makoto_response_no_content() {
        let raw = "MAKOTO/2.0 204 No Content\r\n\r\n";
        let parsed = parse_makoto_response(raw).unwrap();
        assert_eq!(parsed, None);
    }

    #[test]
    fn test_parse_makoto_response_invalid() {
        let raw = "INVALID RESPONSE\r\n";
        assert!(parse_makoto_response(raw).is_err());
    }

    #[test]
    fn test_execute_makoto_dll_missing_file() {
        let res = execute_makoto_dll(Path::new("nonexistent_makoto.dll"), "test");
        assert!(res.is_err());
    }
}

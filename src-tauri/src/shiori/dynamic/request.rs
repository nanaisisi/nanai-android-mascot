//! SHIORI Dynamic Request Handling

use super::engine::ShioriDynamicEngine;

#[cfg(not(windows))]
use super::host::Hglobal;
#[cfg(windows)]
use super::host::{GMEM_FIXED, GlobalAlloc, GlobalFree};

impl ShioriDynamicEngine {
    /// SHIORI::request(req) (SHIORI 2.x 自動フォールバック対応)
    pub fn request(&self, request_str: &str) -> Result<String, String> {
        let res = self.request_raw(request_str);
        if let Ok(ref text) = res
            && (text.contains("400 Bad Request")
                || text.contains("500 Internal")
                || text.is_empty())
            && request_str.starts_with("GET ")
            && request_str.contains("SHIORI/3.0")
        {
            let translated = request_str.replace("SHIORI/3.0", "SHIORI/2.x");
            if let Ok(fallback_res) = self.request_raw(&translated)
                && !fallback_res.contains("400 Bad Request")
            {
                let wrapped = format!(
                    "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: {}\r\n\r\n",
                    fallback_res.trim()
                );
                return Ok(wrapped);
            }
        }
        res
    }

    /// 内部低レベル SHIORI::request 呼び出し
    fn request_raw(&self, request_str: &str) -> Result<String, String> {
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
}

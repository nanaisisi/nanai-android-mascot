//! 32bit SHIORI ホスト
//!
//! 使い方: shiori-host32.exe <dll_path>
//! stdin/stdout で本体(64bit)と通信する。

mod ffi;
mod host;
mod protocol;

use host::load_and_run;

#[cfg(not(test))]
fn main() {
    let dll = std::env::args().nth(1).expect("usage: shiori-host32 <dll>");
    let mut stdin = std::io::stdin().lock();
    let mut stdout = std::io::stdout().lock();
    if let Err(code) = load_and_run(&dll, &mut stdin, &mut stdout) {
        std::process::exit(code);
    }
}

#[cfg(test)]
mod tests {
    use super::ffi::*;
    use super::host::*;
    use super::protocol::*;

    unsafe extern "C" fn load(h: H, _len: i32) -> i32 {
        GlobalFree(h);
        1
    }

    unsafe extern "C" fn unload() -> i32 {
        1
    }

    unsafe extern "C" fn request(h: H, len: *mut i32) -> H {
        GlobalFree(h);
        let resp = b"SHIORI/3.0 200 OK\r\n\r\n";
        *len = resp.len() as i32;
        to_hglobal(resp)
    }

    unsafe extern "C" fn mock_req_null(h: H, len: *mut i32) -> H {
        GlobalFree(h);
        *len = 0;
        std::ptr::null_mut()
    }

    unsafe extern "C" fn mock_req_nonnull_zero_len(h: H, len: *mut i32) -> H {
        GlobalFree(h);
        *len = 0;
        1usize as H
    }

    #[test]
    fn test_reply_protocol_format() {
        let mut buf = Vec::new();
        reply(&mut buf, 1, b"ready");

        assert_eq!(buf.len(), 4 + 4 + 5);
        let status = i32::from_le_bytes(buf[0..4].try_into().unwrap());
        let len = u32::from_le_bytes(buf[4..8].try_into().unwrap());
        let payload = &buf[8..];

        assert_eq!(status, 1);
        assert_eq!(len, 5);
        assert_eq!(payload, b"ready");
    }

    #[test]
    fn test_to_hglobal_alloc_and_free() {
        let data = b"test_payload";
        unsafe {
            let h = to_hglobal(data);
            assert!(!h.is_null());
            let slice = std::slice::from_raw_parts(h as *const u8, data.len());
            assert_eq!(slice, data);
            assert_eq!(*(h as *const u8).add(data.len()), 0);
            GlobalFree(h);
        }
    }

    #[test]
    fn test_to_hglobal_empty() {
        let data = b"";
        unsafe {
            let h = to_hglobal(data);
            assert!(!h.is_null());
            assert_eq!(*(h as *const u8), 0);
            GlobalFree(h);
        }
    }

    #[test]
    fn test_process_single_command_all_commands() {
        let mut stdout = Vec::new();
        assert!(process_single_command(
            1,
            b"path",
            &mut stdout,
            load,
            unload,
            mock_req_null
        ));
        assert!(process_single_command(
            2,
            b"req",
            &mut stdout,
            load,
            unload,
            mock_req_null
        ));
        assert!(process_single_command(
            2,
            b"req",
            &mut stdout,
            load,
            unload,
            mock_req_nonnull_zero_len
        ));
        assert!(process_single_command(
            2,
            b"req",
            &mut stdout,
            load,
            unload,
            request
        ));
        assert!(!process_single_command(
            3,
            b"",
            &mut stdout,
            load,
            unload,
            request
        ));
        assert!(process_single_command(
            99,
            b"",
            &mut stdout,
            load,
            unload,
            request
        ));
    }

    #[test]
    fn test_run_command_loop_eof_and_truncated_payload() {
        let mut empty_in = std::io::Cursor::new(Vec::<u8>::new());
        let mut out1 = Vec::new();
        run_command_loop(&mut empty_in, &mut out1, load, unload, request);

        let mut trunc_bytes = Vec::new();
        trunc_bytes.push(1u8);
        trunc_bytes.extend_from_slice(&10u32.to_le_bytes());
        trunc_bytes.extend_from_slice(b"short");
        let mut trunc_in = std::io::Cursor::new(trunc_bytes);
        let mut out2 = Vec::new();
        run_command_loop(&mut trunc_in, &mut out2, load, unload, request);
    }

    #[test]
    fn test_load_and_run_success_and_failure() {
        let mut empty_in = std::io::Cursor::new(Vec::<u8>::new());
        let mut out_err = Vec::new();
        assert_eq!(
            load_and_run("__non_existent_shiori__.dll", &mut empty_in, &mut out_err),
            Err(2)
        );

        let temp_dir = std::env::temp_dir();
        let src_path = temp_dir.join("mock_shiori_host_test2.rs");
        let dll_path = temp_dir.join("mock_shiori_host_test2.dll");
        std::fs::write(
            &src_path,
            r#"
use std::ffi::c_void;
#[link(name = "kernel32")]
extern "system" {
    fn GlobalAlloc(flags: u32, bytes: usize) -> *mut c_void;
    fn GlobalFree(h: *mut c_void) -> *mut c_void;
}
#[no_mangle]
pub unsafe extern "C" fn load(h: *mut c_void, _len: i32) -> i32 {
    if !h.is_null() { GlobalFree(h); }
    1
}
#[no_mangle]
pub unsafe extern "C" fn unload() -> i32 {
    1
}
#[no_mangle]
pub unsafe extern "C" fn request(h: *mut c_void, len: *mut i32) -> *mut c_void {
    if !h.is_null() { GlobalFree(h); }
    let resp = b"SHIORI/3.0 200 OK\r\n\r\n";
    *len = resp.len() as i32;
    let out = GlobalAlloc(0, resp.len() + 1);
    std::ptr::copy_nonoverlapping(resp.as_ptr(), out as *mut u8, resp.len());
    *(out as *mut u8).add(resp.len()) = 0;
    out
}
"#,
        )
        .unwrap();
        let status = std::process::Command::new("rustc")
            .args([
                "--crate-type=cdylib",
                src_path.to_str().unwrap(),
                "-o",
                dll_path.to_str().unwrap(),
            ])
            .status()
            .unwrap();
        assert!(status.success());

        let mut input = Vec::new();
        input.push(1u8);
        input.extend_from_slice(&4u32.to_le_bytes());
        input.extend_from_slice(b"dir/");
        input.push(2u8);
        input.extend_from_slice(&3u32.to_le_bytes());
        input.extend_from_slice(b"GET");
        input.push(3u8);
        input.extend_from_slice(&0u32.to_le_bytes());

        let mut cursor_in = std::io::Cursor::new(input);
        let mut out_ok = Vec::new();
        assert_eq!(
            load_and_run(dll_path.to_str().unwrap(), &mut cursor_in, &mut out_ok),
            Ok(())
        );
    }
}

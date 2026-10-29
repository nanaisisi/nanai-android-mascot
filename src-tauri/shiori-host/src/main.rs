//! 32bit SHIORI ホスト
//!
//! 使い方: shiori-host32.exe <dll_path>
//! stdin/stdout で本体(64bit)と通信する。
//!   要求: [cmd:u8][len:u32 LE][payload]   cmd 1=load(payload=dirパス) 2=request 3=unload
//!   応答: [status:i32 LE][len:u32 LE][payload]   (statusは load/unload の戻り値、request は 0)

use libloading::{Library, Symbol};
use std::ffi::c_void;
use std::io::{Read, Write};

type H = *mut c_void;
type LoadFn = unsafe extern "C" fn(H, i32) -> i32;
type UnloadFn = unsafe extern "C" fn() -> i32;
type RequestFn = unsafe extern "C" fn(H, *mut i32) -> H;

#[link(name = "kernel32")]
extern "system" {
    fn GlobalAlloc(flags: u32, bytes: usize) -> H;
    fn GlobalFree(h: H) -> H;
}

unsafe fn to_hglobal(data: &[u8]) -> H {
    let h = GlobalAlloc(0, data.len() + 1);
    assert!(!h.is_null(), "GlobalAlloc failed");
    std::ptr::copy_nonoverlapping(data.as_ptr(), h as *mut u8, data.len());
    *(h as *mut u8).add(data.len()) = 0;
    h
}

fn reply(out: &mut impl Write, status: i32, payload: &[u8]) {
    let _ = out.write_all(&status.to_le_bytes());
    let _ = out.write_all(&(payload.len() as u32).to_le_bytes());
    let _ = out.write_all(payload);
    let _ = out.flush();
}

fn process_single_command(
    cmd: u8,
    payload: &[u8],
    stdout: &mut impl Write,
    f_load: LoadFn,
    f_unload: UnloadFn,
    f_req: RequestFn,
) -> bool {
    match cmd {
        1 => unsafe {
            let h = to_hglobal(payload);
            // load は HGLOBAL の所有権を DLL 側へ渡す仕様なので解放しない
            let r = f_load(h, payload.len() as i32);
            reply(stdout, r, &[]);
            true
        },
        2 => unsafe {
            let h = to_hglobal(payload);
            let mut n = payload.len() as i32;
            let res = f_req(h, &mut n);
            if res.is_null() || n <= 0 {
                reply(stdout, 0, &[]);
            } else {
                let s = std::slice::from_raw_parts(res as *const u8, n as usize);
                reply(stdout, 0, s);
                GlobalFree(res);
            }
            true
        },
        3 => {
            let r = unsafe { f_unload() };
            reply(stdout, r, &[]);
            false
        }
        _ => {
            reply(stdout, -1, &[]);
            true
        }
    }
}

fn run_command_loop(
    stdin: &mut impl Read,
    stdout: &mut impl Write,
    f_load: LoadFn,
    f_unload: UnloadFn,
    f_req: RequestFn,
) {
    // 起動完了通知
    reply(stdout, 1, b"ready");

    loop {
        let mut head = [0u8; 5];
        if stdin.read_exact(&mut head).is_err() {
            break;
        }
        let cmd = head[0];
        let len = u32::from_le_bytes([head[1], head[2], head[3], head[4]]) as usize;
        let mut payload = vec![0u8; len];
        if stdin.read_exact(&mut payload).is_err() {
            break;
        }
        if !process_single_command(cmd, &payload, stdout, f_load, f_unload, f_req) {
            break;
        }
    }
}

fn load_and_run(
    dll: &str,
    stdin: &mut impl Read,
    stdout: &mut impl Write,
) -> Result<(), i32> {
    let lib = unsafe { Library::new(dll) }.map_err(|e| {
        eprintln!("load failed: {e}");
        2
    })?;
    let (f_load, f_unload, f_req): (LoadFn, UnloadFn, RequestFn) = unsafe {
        let a: Symbol<LoadFn> = lib.get(b"load").expect("load");
        let b: Symbol<UnloadFn> = lib.get(b"unload").expect("unload");
        let c: Symbol<RequestFn> = lib.get(b"request").expect("request");
        (*a, *b, *c)
    };
    run_command_loop(stdin, stdout, f_load, f_unload, f_req);
    Ok(())
}

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
    use super::*;

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
        assert!(process_single_command(1, b"path", &mut stdout, load, unload, mock_req_null));
        assert!(process_single_command(2, b"req", &mut stdout, load, unload, mock_req_null));
        assert!(process_single_command(
            2,
            b"req",
            &mut stdout,
            load,
            unload,
            mock_req_nonnull_zero_len
        ));
        assert!(process_single_command(2, b"req", &mut stdout, load, unload, request));
        assert!(!process_single_command(3, b"", &mut stdout, load, unload, request));
        assert!(process_single_command(99, b"", &mut stdout, load, unload, request));
    }

    #[test]
    fn test_run_command_loop_eof_and_truncated_payload() {
        // 1. ヘッダ読み込みで即座に EOF に達するケース
        let mut empty_in = std::io::Cursor::new(Vec::<u8>::new());
        let mut out1 = Vec::new();
        run_command_loop(&mut empty_in, &mut out1, load, unload, request);

        // 2. ヘッダで len=10 を指定したがペイロードが途中で切れて EOF になるケース
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
        // 存在しない DLL のロード失敗ケース
        let mut empty_in = std::io::Cursor::new(Vec::<u8>::new());
        let mut out_err = Vec::new();
        assert_eq!(
            load_and_run("__non_existent_shiori__.dll", &mut empty_in, &mut out_err),
            Err(2)
        );

        // テスト内で 64bit ミニマル SHIORI DLL を一時生成して load_and_run を検証する
        let temp_dir = std::env::temp_dir();
        let src_path = temp_dir.join("mock_shiori_host_test.rs");
        let dll_path = temp_dir.join("mock_shiori_host_test.dll");
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
        // cmd 1 (load)
        input.push(1u8);
        input.extend_from_slice(&4u32.to_le_bytes());
        input.extend_from_slice(b"dir/");
        // cmd 2 (request)
        input.push(2u8);
        input.extend_from_slice(&3u32.to_le_bytes());
        input.extend_from_slice(b"GET");
        // cmd 3 (unload -> ループ終了)
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

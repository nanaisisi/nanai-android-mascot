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
    if !h.is_null() {
        std::ptr::copy_nonoverlapping(data.as_ptr(), h as *mut u8, data.len());
        *(h as *mut u8).add(data.len()) = 0;
    }
    h
}

fn reply(out: &mut impl Write, status: i32, payload: &[u8]) {
    let _ = out.write_all(&status.to_le_bytes());
    let _ = out.write_all(&(payload.len() as u32).to_le_bytes());
    let _ = out.write_all(payload);
    let _ = out.flush();
}

fn main() {
    let dll = std::env::args().nth(1).expect("usage: shiori-host32 <dll>");
    let lib = unsafe { Library::new(&dll) }.unwrap_or_else(|e| {
        eprintln!("load failed: {e}");
        std::process::exit(2);
    });
    let (f_load, f_unload, f_req): (LoadFn, UnloadFn, RequestFn) = unsafe {
        let a: Symbol<LoadFn> = lib.get(b"load").expect("load");
        let b: Symbol<UnloadFn> = lib.get(b"unload").expect("unload");
        let c: Symbol<RequestFn> = lib.get(b"request").expect("request");
        (*a, *b, *c)
    };

    let mut stdin = std::io::stdin().lock();
    let mut stdout = std::io::stdout().lock();
    // 起動完了通知
    reply(&mut stdout, 1, b"ready");

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
        match cmd {
            1 => unsafe {
                let h = to_hglobal(&payload);
                // load は HGLOBAL の所有権を DLL 側へ渡す仕様なので解放しない
                let r = f_load(h, payload.len() as i32);
                reply(&mut stdout, r, &[]);
            },
            2 => unsafe {
                let h = to_hglobal(&payload);
                let mut n = payload.len() as i32;
                let res = f_req(h, &mut n);
                if res.is_null() || n <= 0 {
                    reply(&mut stdout, 0, &[]);
                } else {
                    let s = std::slice::from_raw_parts(res as *const u8, n as usize);
                    reply(&mut stdout, 0, s);
                    GlobalFree(res);
                }
            },
            3 => {
                let r = unsafe { f_unload() };
                reply(&mut stdout, r, &[]);
                break;
            }
            _ => reply(&mut stdout, -1, &[]),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
}

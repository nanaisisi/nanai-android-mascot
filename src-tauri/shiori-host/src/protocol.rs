use super::ffi::{to_hglobal, GlobalFree, H, LoadFn, RequestFn, UnloadFn};
use std::io::{Read, Write};

pub fn reply(out: &mut impl Write, status: i32, payload: &[u8]) {
    let _ = out.write_all(&status.to_le_bytes());
    let _ = out.write_all(&(payload.len() as u32).to_le_bytes());
    let _ = out.write_all(payload);
    let _ = out.flush();
}

pub fn process_single_command(
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

pub fn run_command_loop(
    stdin: &mut impl Read,
    stdout: &mut impl Write,
    f_load: LoadFn,
    f_unload: UnloadFn,
    f_req: RequestFn,
) {
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

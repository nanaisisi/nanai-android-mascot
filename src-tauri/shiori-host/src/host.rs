use super::ffi::{LoadFn, RequestFn, UnloadFn};
use super::protocol::run_command_loop;
use libloading::{Library, Symbol};
use std::io::{Read, Write};

pub fn load_and_run(
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

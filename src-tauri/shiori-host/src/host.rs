use super::ffi::{reset_dll_directory, set_dll_directory, LoadFn, RequestFn, UnloadFn};
use super::protocol::run_command_loop;
use libloading::{Library, Symbol};
use std::io::{Read, Write};
use std::path::Path;

pub fn load_and_run(dll: &str, stdin: &mut impl Read, stdout: &mut impl Write) -> Result<(), i32> {
    let dll_path = Path::new(dll);
    if let Some(parent) = dll_path.parent() {
        set_dll_directory(parent);
    }

    let lib = unsafe { Library::new(dll) }.map_err(|e| {
        eprintln!("load failed: {e}");
        reset_dll_directory();
        2
    })?;

    // loadu 優先検索、存在しなければ従来の load にフォールバック
    let (f_load, f_unload, f_req): (LoadFn, UnloadFn, RequestFn) = unsafe {
        let a: LoadFn = if let Ok(sym) = lib.get::<LoadFn>(b"loadu") {
            *sym
        } else {
            *lib.get::<LoadFn>(b"load").expect("neither loadu nor load found")
        };
        let b: Symbol<UnloadFn> = lib.get(b"unload").expect("unload");
        let c: Symbol<RequestFn> = lib.get(b"request").expect("request");
        (a, *b, *c)
    };

    run_command_loop(stdin, stdout, f_load, f_unload, f_req);
    reset_dll_directory();
    Ok(())
}

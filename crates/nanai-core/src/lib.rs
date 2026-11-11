//! Nanai Core - Pure Rust logic (parsers for sakura script, descript, fmo, manifest, update/install protocols)

pub mod install_protocol;
pub mod update_protocol;

pub use install_protocol::*;
pub use update_protocol::*;

/// WASM C-ABI: メモリ動的確保関数 (バッファ渡し用)
#[unsafe(no_mangle)]
pub extern "C" fn wasm_alloc(size: usize) -> *mut u8 {
    let mut buf = Vec::<u8>::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

/// WASM C-ABI: メモリ解放関数
///
/// # Safety
/// `ptr` は過去に `wasm_alloc` で確保されたポインタである必要があります。
#[unsafe(no_mangle)]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn wasm_free(ptr: *mut u8, size: usize) {
    if !ptr.is_null() && size > 0 {
        unsafe {
            drop(Vec::from_raw_parts(ptr, 0, size));
        }
    }
}

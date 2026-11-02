use std::ffi::c_void;

pub type H = *mut c_void;
pub type LoadFn = unsafe extern "C" fn(H, i32) -> i32;
pub type UnloadFn = unsafe extern "C" fn() -> i32;
pub type RequestFn = unsafe extern "C" fn(H, *mut i32) -> H;

#[cfg(windows)]
#[link(name = "kernel32")]
extern "system" {
    pub fn GlobalAlloc(flags: u32, bytes: usize) -> H;
    pub fn GlobalFree(h: H) -> H;
}

#[cfg(not(windows))]
extern "C" {
    fn malloc(size: usize) -> *mut c_void;
    fn free(ptr: *mut c_void);
}

#[cfg(not(windows))]
#[allow(non_snake_case)]
pub unsafe fn GlobalAlloc(_flags: u32, bytes: usize) -> H {
    malloc(bytes)
}

#[cfg(not(windows))]
#[allow(non_snake_case)]
pub unsafe fn GlobalFree(h: H) -> H {
    if !h.is_null() {
        free(h);
    }
    std::ptr::null_mut()
}

pub unsafe fn to_hglobal(data: &[u8]) -> H {
    let h = GlobalAlloc(0, data.len() + 1);
    assert!(!h.is_null(), "GlobalAlloc failed");
    std::ptr::copy_nonoverlapping(data.as_ptr(), h as *mut u8, data.len());
    *(h as *mut u8).add(data.len()) = 0;
    h
}

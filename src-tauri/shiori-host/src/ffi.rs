use std::ffi::c_void;

pub type H = *mut c_void;
pub type LoadFn = unsafe extern "C" fn(H, i32) -> i32;
pub type UnloadFn = unsafe extern "C" fn() -> i32;
pub type RequestFn = unsafe extern "C" fn(H, *mut i32) -> H;

#[link(name = "kernel32")]
extern "system" {
    pub fn GlobalAlloc(flags: u32, bytes: usize) -> H;
    pub fn GlobalFree(h: H) -> H;
}

pub unsafe fn to_hglobal(data: &[u8]) -> H {
    let h = GlobalAlloc(0, data.len() + 1);
    assert!(!h.is_null(), "GlobalAlloc failed");
    std::ptr::copy_nonoverlapping(data.as_ptr(), h as *mut u8, data.len());
    *(h as *mut u8).add(data.len()) = 0;
    h
}

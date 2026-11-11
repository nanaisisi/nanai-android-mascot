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
    pub fn SetDllDirectoryW(lpPathName: *const u16) -> i32;
}

#[cfg(not(windows))]
extern "C" {
    fn malloc(size: usize) -> *mut c_void;
    fn free(ptr: *mut c_void);
}

#[cfg(windows)]
pub fn set_dll_directory(dir_path: &std::path::Path) -> bool {
    use std::os::windows::ffi::OsStrExt;
    let mut wide: Vec<u16> = dir_path.as_os_str().encode_wide().collect();
    wide.push(0);
    unsafe { SetDllDirectoryW(wide.as_ptr()) != 0 }
}

#[cfg(windows)]
pub fn reset_dll_directory() {
    unsafe {
        SetDllDirectoryW(std::ptr::null());
    }
}

#[cfg(not(windows))]
pub fn set_dll_directory(_dir_path: &std::path::Path) -> bool {
    true
}

#[cfg(not(windows))]
pub fn reset_dll_directory() {}

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

//! Nanai Core - Pure Rust logic (parsers for sakura script, descript, fmo, manifest, update/install protocols)

pub mod balloon_descript;
pub mod balloon_layout;
pub mod descript_parser;
pub mod install_protocol;
pub mod sakura_player;
pub mod sakura_script;
pub mod seriko_animation;
pub mod shiori_protocol;
pub mod sstp_fmo;
pub mod state;
pub mod surface_collision;
pub mod surface_compositor;
pub mod surfaces_parser;
pub mod update_protocol;

pub use balloon_descript::*;
pub use balloon_layout::*;
pub use descript_parser::*;
pub use install_protocol::*;
pub use sakura_player::*;
pub use sakura_script::*;
pub use seriko_animation::*;
pub use shiori_protocol::*;
pub use sstp_fmo::*;
pub use state::*;
pub use surface_collision::*;
pub use surface_compositor::*;
pub use surfaces_parser::*;
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
pub unsafe extern "C" fn wasm_free(ptr: *mut u8, size: usize) {
    if !ptr.is_null() && size > 0 {
        unsafe {
            drop(Vec::from_raw_parts(ptr, 0, size));
        }
    }
}

/// さくらスクリプトをパースして JSON 文字列バッファポインタ情報を返却 (WASM C-ABI)
/// 上位32ビット: ptr, 下位32ビット: len
/// # Safety
/// `ptr` must be a valid pointer to bytes of length `len`.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn wasm_parse_sakura_script_json(ptr: *const u8, len: usize) -> u64 {
    if ptr.is_null() || len == 0 {
        return 0;
    }
    let slice = unsafe { std::slice::from_raw_parts(ptr, len) };
    if let Ok(script) = std::str::from_utf8(slice) {
        let tokens = parse_sakura_script(script);
        if let Ok(json) = serde_json::to_string(&tokens) {
            let json_bytes = json.into_bytes();
            let json_len = json_bytes.len();
            let json_ptr = wasm_alloc(json_len);
            unsafe {
                std::ptr::copy_nonoverlapping(json_bytes.as_ptr(), json_ptr, json_len);
            }
            return ((json_ptr as u64) << 32) | (json_len as u64);
        }
    }
    0
}

/// SSTPリクエストをパースして JSON 文字列バッファポインタ情報を返却 (WASM C-ABI)
/// 上位32ビット: ptr, 下位32ビット: len
/// # Safety
/// `ptr` must be a valid pointer to bytes of length `len`.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn wasm_parse_sstp_request_json(ptr: *const u8, len: usize) -> u64 {
    if ptr.is_null() || len == 0 {
        return 0;
    }
    let slice = unsafe { std::slice::from_raw_parts(ptr, len) };
    if let Ok(raw_sstp) = std::str::from_utf8(slice)
        && let Some(req) = parse_sstp_request(raw_sstp)
        && let Ok(json) = serde_json::to_string(&req)
    {
        let json_bytes = json.into_bytes();
        let json_len = json_bytes.len();
        let json_ptr = wasm_alloc(json_len);
        unsafe {
            std::ptr::copy_nonoverlapping(json_bytes.as_ptr(), json_ptr, json_len);
        }
        return ((json_ptr as u64) << 32) | (json_len as u64);
    }
    0
}

// =========================================================================
// ビルド時 (Cargo Feature) によるプラットフォーム/OS 向け機能分岐スタブ
// =========================================================================

/// Android 組み込み最適化ビルド時の初期化スタブ
#[cfg(feature = "target-android")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn init_platform_runtime() -> String {
    "Initialized nanai-core runtime for [Android WASM]".to_string()
}

/// Desktop (PC) ビルド時の初期化スタブ
#[cfg(feature = "target-desktop")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn init_platform_runtime() -> String {
    "Initialized nanai-core runtime for [Desktop WASM]".to_string()
}

/// 汎用 Web ビルド時の初期化スタブ
#[cfg(all(
    feature = "target-web",
    not(feature = "target-android"),
    not(feature = "target-desktop")
))]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn init_platform_runtime() -> String {
    "Initialized nanai-core runtime for [Generic Web WASM]".to_string()
}

// =========================================================================
// MascotEngineState (WASM Single Source of Truth Engine FFI)
// =========================================================================

#[wasm_bindgen::prelude::wasm_bindgen]
pub struct MascotEngine {
    inner: MascotEngineState,
}

#[wasm_bindgen::prelude::wasm_bindgen]
impl MascotEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: MascotEngineState::new(),
        }
    }

    pub fn select_ghost(&mut self, ghost_name: &str) {
        self.inner.select_ghost(ghost_name);
    }

    pub fn select_shell(&mut self, shell_name: &str) {
        self.inner.select_shell(shell_name);
    }

    pub fn set_surface(&mut self, scope: u32, surface_id: u32) {
        self.inner.set_surface(scope, surface_id);
    }

    pub fn get_surface(&self, scope: u32) -> u32 {
        self.inner.get_surface(scope)
    }

    pub fn enqueue_script(&mut self, script: &str) {
        self.inner.enqueue_script(script);
    }

    pub fn tick(&mut self, delta_ms: f64) {
        self.inner.tick(delta_ms);
    }

    pub fn tick_json(&mut self, delta_ms: f64) -> String {
        let res = self.inner.tick(delta_ms);
        serde_json::to_string(&res).unwrap_or_else(|_| "{}".to_string())
    }

    pub fn is_playing(&self) -> bool {
        self.inner.is_playing_script
    }

    pub fn get_state_json(&self) -> String {
        serde_json::to_string(&self.inner).unwrap_or_else(|_| "{}".to_string())
    }
}


//! SHIORI FFI Bindings
//!
//! YAYAとSATORIYAのC++コードとのFFI（Foreign Function Interface）定義

use libc::{c_char, c_int, c_long, c_void};
use nanai_android_mascot_ui::{ShioriMethod, ShioriRequest};
use std::ffi::{CStr, CString};
use std::ptr;

/// SHIORI/3.0プロトコルの戻り値
pub type HGLOBAL = *mut c_void;

/// YAYA SHIORI エクスポート関数の定義
extern "C" {
    // YAYAの主要なエクスポート関数
    pub fn load(h: HGLOBAL, len: c_long) -> c_int;
    pub fn unload() -> c_int;
    pub fn request(h: HGLOBAL, len: *mut c_long) -> HGLOBAL;

    // YAYA固有の関数
    pub fn SHIORI_FW(h: HGLOBAL, len: *mut c_long) -> HGLOBAL;
}

/// SHIORI関数の安全なRustラッパー
pub struct ShioriInterface {
    is_loaded: bool,
}

impl ShioriInterface {
    pub fn new() -> Self {
        ShioriInterface { is_loaded: false }
    }

    /// SHIORIの初期化
    pub fn load(&mut self, dirpath: &str) -> Result<(), String> {
        if self.is_loaded {
            return Err("SHIORI is already loaded".to_string());
        }

        let dirpath_cstring =
            CString::new(dirpath).map_err(|e| format!("Invalid directory path: {}", e))?;

        let dirpath_ptr = dirpath_cstring.as_ptr() as HGLOBAL;
        let dirpath_len = dirpath_cstring.as_bytes().len() as c_long;

        unsafe {
            let result = load(dirpath_ptr, dirpath_len);
            if result == 1 {
                self.is_loaded = true;
                Ok(())
            } else {
                Err(format!("SHIORI load failed with code: {}", result))
            }
        }
    }

    /// SHIORIの終了処理
    pub fn unload(&mut self) -> Result<(), String> {
        if !self.is_loaded {
            return Ok(());
        }

        unsafe {
            let result = unload();
            self.is_loaded = false;

            if result == 1 {
                Ok(())
            } else {
                Err(format!("SHIORI unload failed with code: {}", result))
            }
        }
    }

    /// SHIORIリクエストの送信
    pub fn request(&self, request_str: &str) -> Result<String, String> {
        if !self.is_loaded {
            return Err("SHIORI is not loaded".to_string());
        }

        let request_cstring =
            CString::new(request_str).map_err(|e| format!("Invalid request string: {}", e))?;

        let request_ptr = request_cstring.as_ptr() as HGLOBAL;
        let mut response_len: c_long = 0;

        unsafe {
            let response_ptr = request(request_ptr, &mut response_len);

            if response_ptr.is_null() {
                return Err("SHIORI request returned null".to_string());
            }

            // レスポンスを文字列に変換
            let response_slice =
                std::slice::from_raw_parts(response_ptr as *const u8, response_len as usize);

            // UTF-8として解釈
            let response_str = String::from_utf8_lossy(response_slice).to_string();

            // メモリを解放（YAYAが提供する方法で解放する必要がある）
            // TODO: 適切なメモリ解放方法を実装

            Ok(response_str)
        }
    }

    /// SHIORI/3.0 フレームワークリクエスト
    pub fn shiori_fw(&self, request_str: &str) -> Result<String, String> {
        if !self.is_loaded {
            return Err("SHIORI is not loaded".to_string());
        }

        let request_cstring =
            CString::new(request_str).map_err(|e| format!("Invalid request string: {}", e))?;

        let request_ptr = request_cstring.as_ptr() as HGLOBAL;
        let mut response_len: c_long = 0;

        unsafe {
            let response_ptr = SHIORI_FW(request_ptr, &mut response_len);

            if response_ptr.is_null() {
                return Err("SHIORI_FW request returned null".to_string());
            }

            let response_slice =
                std::slice::from_raw_parts(response_ptr as *const u8, response_len as usize);

            let response_str = String::from_utf8_lossy(response_slice).to_string();

            Ok(response_str)
        }
    }

    pub fn is_loaded(&self) -> bool {
        self.is_loaded
    }
}

impl Drop for ShioriInterface {
    fn drop(&mut self) {
        if self.is_loaded {
            let _ = self.unload();
        }
    }
}

/// SHIORIリクエストの構築ヘルパー（`nanai_android_mascot_ui::shiori` の
/// ukadoc-spec 準拠モデルへ委譲。ステータス行の単数化・`ID:` ヘッダ対応）
pub struct ShioriRequestBuilder {
    request: ShioriRequest,
}

impl ShioriRequestBuilder {
    pub fn new() -> Self {
        ShioriRequestBuilder {
            request: ShioriRequest::default(),
        }
    }

    pub fn method(mut self, method: &str) -> Self {
        if method.eq_ignore_ascii_case("NOTIFY") {
            self.request.method = ShioriMethod::Notify;
        } else {
            self.request.method = ShioriMethod::Get;
        }
        self
    }

    pub fn header(self, _key: &str, _value: &str) -> Self {
        // 任意ヘッダは ukadoc-spec 外のため無視（Event 等の誤送出を防ぐ）
        self
    }

    pub fn sender(mut self, sender: &str) -> Self {
        self.request.sender = sender.to_string();
        self
    }

    pub fn charset(mut self, charset: &str) -> Self {
        self.request.charset = charset.to_string();
        self
    }

    /// イベントID（ukadoc-spec では `ID:` ヘッダ）
    pub fn event(mut self, event: &str) -> Self {
        self.request.id = event.to_string();
        self
    }

    pub fn reference(mut self, index: usize, value: &str) -> Self {
        if self.request.references.len() <= index {
            self.request.references.resize(index + 1, String::new());
        }
        self.request.references[index] = value.to_string();
        self
    }

    pub fn build(self) -> String {
        let mut req = self.request;
        if req.sender.is_empty() {
            req.sender = "NanaiMascot".to_string();
        }
        if req.charset.is_empty() {
            req.charset = "UTF-8".to_string();
        }
        req.build()
    }
}

impl Default for ShioriRequestBuilder {
    fn default() -> Self {
        Self::new()
    }
}

/// 便利な関数群
impl ShioriRequestBuilder {
    /// OnBootイベントのリクエストを作成
    pub fn on_boot() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnBoot")
            .charset("UTF-8")
    }

    /// OnCloseイベントのリクエストを作成
    pub fn on_close() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnClose")
            .charset("UTF-8")
    }

    /// OnMouseClickイベントのリクエストを作成
    pub fn on_mouse_click(x: i32, y: i32, button: &str) -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnMouseClick")
            .reference(0, &x.to_string())
            .reference(1, &y.to_string())
            .reference(2, button)
            .charset("UTF-8")
    }

    /// OnSecondChangeイベントのリクエストを作成
    pub fn on_second_change() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnSecondChange")
            .charset("UTF-8")
    }

    /// OnMinuteChangeイベントのリクエストを作成
    pub fn on_minute_change() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnMinuteChange")
            .charset("UTF-8")
    }

    /// OnWindowStateMinimizeイベントのリクエストを作成
    pub fn on_window_state_minimize() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnWindowStateMinimize")
            .charset("UTF-8")
    }

    /// OnWindowStateRestoreイベントのリクエストを作成
    pub fn on_window_state_restore() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnWindowStateRestore")
            .charset("UTF-8")
    }

    /// OnBIFFBeginイベントのリクエストを作成 (メールチェック開始)
    pub fn on_biff_begin() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnBIFFBegin")
            .charset("UTF-8")
    }

    /// OnBIFFCompleteイベントのリクエストを作成 (メールチェック完了)
    pub fn on_biff_complete(count: u32, size_bytes: u64, account_name: Option<&str>) -> Self {
        let mut builder = ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnBIFFComplete")
            .reference(0, &count.to_string())
            .reference(1, &size_bytes.to_string())
            .charset("UTF-8");
        if let Some(account) = account_name {
            builder = builder.reference(2, account);
        }
        builder
    }

    /// OnBIFF2Completeイベントのリクエストを作成 (メールチェック詳細完了通知)
    pub fn on_biff_2_complete(count: u32, size_bytes: u64, account_name: Option<&str>, unread_count: Option<u32>) -> Self {
        let mut builder = ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnBIFF2Complete")
            .reference(0, &count.to_string())
            .reference(1, &size_bytes.to_string())
            .charset("UTF-8");
        if let Some(account) = account_name {
            builder = builder.reference(2, account);
        }
        if let Some(unread) = unread_count {
            builder = builder.reference(3, &unread.to_string());
        }
        builder
    }

    /// OnBIFFFailureイベントのリクエストを作成 (メールチェック失敗)
    pub fn on_biff_failure(reason: &str, account_name: Option<&str>) -> Self {
        let mut builder = ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnBIFFFailure")
            .reference(0, reason)
            .charset("UTF-8");
        if let Some(account) = account_name {
            builder = builder.reference(1, account);
        }
        builder
    }

    /// OnUpdateResultExplorerイベントのリクエストを作成 (更新結果の詳細エクスプローラ表示)
    pub fn on_update_result_explorer(status: &str, log_path: Option<&str>) -> Self {
        let mut builder = ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnUpdateResultExplorer")
            .reference(0, status)
            .charset("UTF-8");
        if let Some(path) = log_path {
            builder = builder.reference(1, path);
        }
        builder
    }

    /// 任意のイベント名と参照引数から汎用リクエストを作成
    pub fn generic_event(event_name: &str, references: &[&str]) -> Self {
        let mut builder = ShioriRequestBuilder::new()
            .method("GET")
            .event(event_name)
            .charset("UTF-8");
        for (i, ref_val) in references.iter().enumerate() {
            builder = builder.reference(i, ref_val);
        }
        builder
    }
}

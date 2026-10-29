#![allow(dead_code)]
//! SHIORI Request Builder
//!
//! ukadoc-spec 準拠モデルのSHIORIリクエスト構築ヘルパー

use nanai_android_mascot_ui::{ShioriMethod, ShioriRequest};

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

impl ShioriRequestBuilder {
    pub fn on_boot() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnBoot")
            .charset("UTF-8")
    }

    pub fn on_close() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnClose")
            .charset("UTF-8")
    }

    pub fn on_mouse_click(x: i32, y: i32, button: &str) -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnMouseClick")
            .reference(0, &x.to_string())
            .reference(1, &y.to_string())
            .reference(2, button)
            .charset("UTF-8")
    }

    pub fn on_second_change() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnSecondChange")
            .charset("UTF-8")
    }

    pub fn on_minute_change() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnMinuteChange")
            .charset("UTF-8")
    }

    pub fn on_window_state_minimize() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnWindowStateMinimize")
            .charset("UTF-8")
    }

    pub fn on_window_state_restore() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnWindowStateRestore")
            .charset("UTF-8")
    }

    pub fn on_biff_begin() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .event("OnBIFFBegin")
            .charset("UTF-8")
    }

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shiori_request_builder_on_boot() {
        let req = ShioriRequestBuilder::on_boot().build();
        assert!(req.contains("OnBoot"));
        assert!(req.contains("NOTIFY"));
    }

    #[test]
    fn test_shiori_request_builder_mouse_click() {
        let req = ShioriRequestBuilder::on_mouse_click(100, 200, "0").build();
        assert!(req.contains("OnMouseClick"));
        assert!(req.contains("100"));
        assert!(req.contains("200"));
    }

    #[test]
    fn test_shiori_request_builder_biff() {
        let req = ShioriRequestBuilder::on_biff_complete(3, 1024, Some("default")).build();
        assert!(req.contains("OnBIFFComplete"));
        assert!(req.contains("3"));
        assert!(req.contains("1024"));
        assert!(req.contains("default"));
    }
}

//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (BIFF・ヘッドライン等)

use crate::shiori_protocol_helpers::build_shiori_request_extended;

/// OnBIFFBegin イベントリクエスト構築 (ukadoc-spec/list/shiori-event/biff/OnBIFFBegin.md)
pub fn build_on_biff_request() -> String {
    build_shiori_request_extended("GET", "OnBIFFBegin", &[], None)
}

/// OnBIFFComplete イベントリクエスト構築 (ukadoc-spec/list/shiori-event/biff/OnBIFFComplete.md)
pub fn build_on_biff_complete_request(mail_count: usize, total_size: u64) -> String {
    let refs = vec![mail_count.to_string(), total_size.to_string()];
    build_shiori_request_extended("GET", "OnBIFFComplete", &refs, None)
}

/// OnBIFFFailure イベントリクエスト構築 (ukadoc-spec/list/shiori-event/biff/OnBIFFFailure.md)
pub fn build_on_biff_failure_request(reason: &str) -> String {
    let refs = vec![reason.to_string()];
    build_shiori_request_extended("GET", "OnBIFFFailure", &refs, None)
}

/// OnBIFF2Complete イベントリクエスト構築 (ukadoc-spec/list/shiori-event/biff/OnBIFF2Complete.md)
pub fn build_on_biff2_complete_request(mail_count: usize, unread_count: usize) -> String {
    let refs = vec![mail_count.to_string(), unread_count.to_string()];
    build_shiori_request_extended("GET", "OnBIFF2Complete", &refs, None)
}

/// OnHeadlinesenseBegin イベントリクエスト構築 (ukadoc-spec/list/shiori-event/headline-rss/OnHeadlinesenseBegin.md)
pub fn build_on_headlinesense_begin_request(headline_name: &str) -> String {
    let refs = vec![headline_name.to_string()];
    build_shiori_request_extended("GET", "OnHeadlinesenseBegin", &refs, None)
}

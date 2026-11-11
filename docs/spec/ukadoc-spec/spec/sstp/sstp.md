# sstp : 概要

- **規格**: [sstp.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/sstp/) (ukadoc-spec/spec/sstp/sstp.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

SSTP 未対応。

## 実装箇所

- `src-tauri/src/lib.rs:25` `mod sstp;`
- `src-tauri/src/lib.rs:192` `sstp::handler::request_processor::send_sstp_request,`
- `src-tauri/src/lib.rs:193` `sstp::handler::request_processor::parse_and_send_sstp_raw,`
- `src-tauri/src/lib.rs:194` `sstp::handler::notifications::notify_sstp_break,`
- `src-tauri/src/lib.rs:195` `sstp::handler::notifications::notify_sstp_blacklisting,`

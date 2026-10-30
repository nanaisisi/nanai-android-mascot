# sstp : 概要

- **規格**: [sstp.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/sstp/) (ukadoc-spec/spec/sstp/sstp.md)
- **対応状況**: ❌ 未実装

## 突合結果

SSTP 未対応。


## 実装箇所

- `src-tauri/src/lib.rs:23` `mod sstp;`
- `src-tauri/src/lib.rs:160` `sstp::send_sstp_request,`
- `src-tauri/src/sstp.rs:30` `pub async fn send_sstp_request(`
- `src-tauri/src/sstp.rs:41` `.emit("sstp-execute-script", script)`
- `src-tauri/src/sstp.rs:48` `.emit("sstp-execute-event", event)`

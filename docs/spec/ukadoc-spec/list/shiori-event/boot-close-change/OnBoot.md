# OnBoot

- **規格**: [OnBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnBoot/) (ukadoc-spec/list/shiori-event/boot-close-change/OnBoot.md)
- **検索語**: OnBoot
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnBoot SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:77` `.event("OnBoot")`
- `src-tauri/src/shiori/ffi/builder.rs:210` `assert!(req.contains("OnBoot"));`
- `crates/nanai-shiori-vm/src/lib.rs:40` `if request.contains("ID: OnBoot") {`
- `crates/nanai-shiori-vm/src/lib.rs:378` `let res_boot = state.handle_request("GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n");`
- `crates/nanai-shiori-vm/src/lib.rs:379` `assert!(res_boot.contains("OnBoot") || res_boot.contains("起動しました"));`

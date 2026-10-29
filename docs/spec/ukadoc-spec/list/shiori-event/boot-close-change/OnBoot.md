# OnBoot

- **規格**: [OnBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnBoot/) (ukadoc-spec/list/shiori-event/boot-close-change/OnBoot.md)
- **検索語**: OnBoot
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:77` `.event("OnBoot")`
- `crates/ui/src/shiori/mod.rs:36` `base_id: Some("OnBoot".into()),`
- `crates/ui/src/shiori/mod.rs:47` `assert!(text.contains("BaseID: OnBoot\r\n"));`
- `crates/ui/src/shiori/mod.rs:73` `assert_eq!(parsed.base_id.as_deref(), Some("OnBoot"));`
- `crates/ui/src/shiori/mod.rs:106` `let err = ShioriRequest::parse("GET SHIORI/2.0\r\nID: OnBoot\r\n\r\n").unwrap_er`

# OnBoot

- **規格**: [OnBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnBoot/) (ukadoc-spec/list/shiori-event/boot-close-change/OnBoot.md)
- **検索語**: OnBoot
- **対応状況**: ✅ 実装済

## 突合結果

OnBoot SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:77` `.event("OnBoot")`
- `src-tauri/src/shiori/ffi/builder.rs:210` `assert!(req.contains("OnBoot"));`
- `crates/ui/src/shiori/protocol/request.rs:24` `/// 互換可能な基本イベント名（SSP拡張。`OnFirstBoot` → `OnBoot` など）`
- `crates/ui/src/shiori/protocol/request.rs:180` `let get_req = ShioriRequest::get("OnBoot", &["ref0".into()]);`
- `crates/ui/src/shiori/protocol/request.rs:182` `assert_eq!(get_req.id, "OnBoot");`

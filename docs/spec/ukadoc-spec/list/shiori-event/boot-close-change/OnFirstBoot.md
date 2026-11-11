# OnFirstBoot

- **規格**: [OnFirstBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnFirstBoot/) (ukadoc-spec/list/shiori-event/boot-close-change/OnFirstBoot.md)
- **検索語**: OnFirstBoot
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnFirstBoot SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `crates/ui/src/shiori/protocol/request/types.rs:24` `/// 互換可能な基本イベント名（SSP拡張。`OnFirstBoot` → `OnBoot` など）`
- `crates/ui/src/shiori/tests/request_tests.rs:13` `id: "OnFirstBoot".into(),`
- `crates/ui/src/shiori/tests/request_tests.rs:26` `assert!(text.contains("ID: OnFirstBoot\r\n"));`
- `crates/ui/src/shiori/tests/request_tests.rs:31` `let id_pos = text.find("ID: OnFirstBoot").unwrap();`
- `crates/ui/src/shiori/tests/request_tests.rs:50` `assert_eq!(parsed.id, "OnFirstBoot");`

# OnFirstBoot

- **規格**: [OnFirstBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnFirstBoot/) (ukadoc-spec/list/shiori-event/boot-close-change/OnFirstBoot.md)
- **検索語**: OnFirstBoot
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「OnFirstBoot」を確認。


## 実装箇所

- `crates/ui/src/shiori/mod.rs:35` `id: "OnFirstBoot".into(),`
- `crates/ui/src/shiori/mod.rs:48` `assert!(text.contains("ID: OnFirstBoot\r\n"));`
- `crates/ui/src/shiori/mod.rs:53` `let id_pos = text.find("ID: OnFirstBoot").unwrap();`
- `crates/ui/src/shiori/mod.rs:72` `assert_eq!(parsed.id, "OnFirstBoot");`
- `crates/ui/src/shiori/protocol/request.rs:24` `/// 互換可能な基本イベント名（SSP拡張。`OnFirstBoot`→`OnBoot` など）`

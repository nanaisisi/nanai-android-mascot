# 省略時の文字コード

- **規格**: [i18n.md](../../../../ukadoc-ssp/config/i18n.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/i18n/))
- **検索語**: i18n, charset, Shift_JIS
- **対応状況**: ✅ 実装済

## 突合結果

言語切替（`rust_i18n::i18n!`）および Shift_JIS 自動判別を実装済み。


## 実装箇所

- `crates/ui/src/main.rs:5` `rust_i18n::i18n!("locales");`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `ui/assets/LICENSE-3RD-PARTY.html:6997` `<li><a href="https://github.com/longbridge/rust-i18n" target="_blank" rel="noope`
- `ui/ts/ui/modal-settings-handlers.ts:224` `const alwaysUtf8I18n = getCheck("always-utf8-charset-i18n");`
- `tests/surfacetable-helper.test.ts:11` `charset: "UTF-8",`
- `crates/nanai-core/src/descript_parser/tests.rs:19` `assert_eq!(manifest.charset(), Some("Shift_JIS"));`

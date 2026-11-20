# メニューフォント設定上書き / バルーンフォント設定上書き

- **規格**: [i18n.md](../../../../ukadoc-ssp/config/i18n.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/i18n/))
- **検索語**: i18n, font
- **対応状況**: ✅ 実装済

## 突合結果

メニュー/バルーンフォント設定の上書き UI は未実装。


## 実装箇所

- `crates/ui/src/main.rs:5` `rust_i18n::i18n!("locales");`
- `src-tauri/src/commands/shell/balloon.rs:851` `std::fs::write(d.join("balloonp2def0s.txt"), "font.color.r,255\n").unwrap();`
- `ui/assets/LICENSE-3RD-PARTY.html:6997` `<li><a href="https://github.com/longbridge/rust-i18n" target="_blank" rel="noope`
- `ui/ts/ui/modal-settings-handlers.ts:224` `const alwaysUtf8I18n = getCheck("always-utf8-charset-i18n");`
- `tests/balloon-cycle10-typography.test.ts:3` `import { applyGroupProperties } from "../ui/ts/core/actions/balloon-descript/fon`
- `crates/nanai-core/src/descript_parser/tests.rs:71` `let content = "font.name,Meiryo\nfont.height,14\nfont.color.r,255\nfont.color.g,`

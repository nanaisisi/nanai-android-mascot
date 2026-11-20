# 文字コード設定

- **規格**: [index.md](../../../../ukadoc-ssp/config/index.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/index/))
- **検索語**: charset
- **対応状況**: ✅ 実装済

## 突合結果

文字コード自動判別・設定を一部対応。


## 実装箇所

- `crates/nanai-core/src/descript_parser/tests.rs:19` `assert_eq!(manifest.charset(), Some("Shift_JIS"));`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `ui/assets/LICENSE-3RD-PARTY.html:4` `<meta charset="UTF-8">`
- `ui/balloon.html:4` `<meta charset="UTF-8" />`
- `tests/surfacetable-helper.test.ts:11` `charset: "UTF-8",`
- `crates/nanai-core/src/descript_parser/tests.rs:24` `let content = "charset=UTF-8\nmenu.background.bitmap=menu_bg.png\n";`

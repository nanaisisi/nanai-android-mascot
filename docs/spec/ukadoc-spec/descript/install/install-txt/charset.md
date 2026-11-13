# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/charset.md)
- **検索語**: charset
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `charset` キーをパース・参照する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:44` `pub fn charset(&self) -> Option<&str> {`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `ui/assets/LICENSE-3RD-PARTY.html:4` `<meta charset="UTF-8">`
- `ui/balloon.html:4` `<meta charset="UTF-8" />`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:111` `"readme.charset": "UTF-8",`
- `crates/nanai-core/src/descript_parser.rs:45` `self.get("charset")`

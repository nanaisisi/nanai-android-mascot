# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/descript.rs` の `read_descript_file()` において `charset,shift_jis` や `charset,sjis` ディレクティブを検出判別し、適切なエンコーディングデコード（Shift_JIS / UTF-8）を実行する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:44` `pub fn charset(&self) -> Option<&str> {`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `ui/assets/LICENSE-3RD-PARTY.html:4` `<meta charset="UTF-8">`
- `ui/balloon.html:4` `<meta charset="UTF-8" />`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:111` `"readme.charset": "UTF-8",`
- `crates/nanai-core/src/descript_parser.rs:45` `self.get("charset")`

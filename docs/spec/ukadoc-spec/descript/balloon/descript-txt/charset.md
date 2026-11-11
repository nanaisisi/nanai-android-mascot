# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ⚠️ 一部対応

## 突合結果

バックエンドの `read_descript_file` およびファイルパーサ（`descript.rs`）において、Shift_JIS（CP932）と UTF-8 の自動判別デコード（`encoding_rs::SHIFT_JIS`）による透過的な文字コード処理が実装されている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:50` `let _cs = map.get("charset");`
- `src-tauri/src/commands/ext.rs:118` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:119` `let _cs = map.get("charset");`
- `src-tauri/src/commands/install/utils.rs:22` `if lower.contains("charset,shift_jis") || lower.contains("charset,sjis") {`

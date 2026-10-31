# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ✅ 対応済

## 突合結果

バックエンドの `read_descript_file` およびファイルパーサ（`descript.rs`）において、Shift_JIS（CP932）と UTF-8 の自動判別デコード（`encoding_rs::SHIFT_JIS`）による透過的な文字コード処理が実装されている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:47` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:50` `let _cs = map.get("charset");`
- `src-tauri/src/commands/ext.rs:116` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], `
- `src-tauri/src/commands/ext.rs:118` `let _readme_cs = map.get("readme.charset");`

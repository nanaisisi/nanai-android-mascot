# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/descript.rs` の `read_descript_file()` において `charset,shift_jis` や `charset,sjis` ディレクティブを検出判別し、適切なエンコーディングデコード（Shift_JIS / UTF-8）を実行する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:50` `let _cs = map.get("charset");`
- `src-tauri/src/commands/ext.rs:118` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:119` `let _cs = map.get("charset");`
- `src-tauri/src/commands/install/utils.rs:22` `if lower.contains("charset,shift_jis") || lower.contains("charset,sjis") {`

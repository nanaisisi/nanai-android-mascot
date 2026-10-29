# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ✅ 対応済

## 突合結果

バックエンドの `read_descript_file` およびファイルパーサ（`descript.rs`）において、Shift_JIS（CP932）と UTF-8 の自動判別デコード（`encoding_rs::SHIFT_JIS`）による透過的な文字コード処理が実装されている。


## 実装箇所

- `src-tauri/src/commands/install/utils.rs:20` `if lower.contains("charset,shift_jis") || lower.contains("charset,sjis") {`
- `src-tauri/src/ghost/scan/descript.rs:13` `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/ghost/scan/descript.rs:14` `|| utf8_str.to_lowercase().contains("charset,sjis")`
- `src-tauri/src/shiori/ffi/builder.rs:37` `pub fn charset(mut self, charset: &str) -> Self {`
- `src-tauri/src/shiori/ffi/builder.rs:38` `self.request.charset = charset.to_string();`

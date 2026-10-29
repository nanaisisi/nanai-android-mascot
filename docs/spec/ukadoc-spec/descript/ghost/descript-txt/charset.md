# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/charset/) (ukadoc-spec/descript/ghost/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:20` `if lower.contains("charset,shift_jis") || lower.contains("charset,sjis") {`
- `src-tauri/src/ghost/scan/descript.rs:13` `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/ghost/scan/descript.rs:14` `|| utf8_str.to_lowercase().contains("charset,sjis")`
- `src-tauri/src/shiori/ffi/builder.rs:37` `pub fn charset(mut self, charset: &str) -> Self {`
- `src-tauri/src/shiori/ffi/builder.rs:38` `self.request.charset = charset.to_string();`

# sstp : SSTP over HTTP

- **規格**: [http.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/http/) (ukadoc-spec/spec/sstp/http.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

HTTP SSTP サーバなし。

## 実装箇所

- `src-tauri/tauri.conf.json:9` `"devUrl": "http://localhost:5173",`
- `src-tauri/tauri.test.conf.json:9` `"devUrl": "http://localhost:5173",`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:16` `|| normalized.starts_with("http://")`
- `crates/ui/src/script/parser/tests.rs:34` `\\![execute,download,http://example.com,path]\`
- `crates/ui/src/script/parser/tests.rs:35` `\\![execute,upload,http://example.com,path]\`

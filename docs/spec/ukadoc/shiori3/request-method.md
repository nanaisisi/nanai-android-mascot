# SHIORI/3.0 request: メソッド (GET / NOTIFY)

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust側 ffi.rs で GET / NOTIFY を使い分け。JS側 shiori-protocol.js の buildRequest は GET 固定。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。

# SHIORI/3.0 request: Charset

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: Charset
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/src/commands/shiori/protocol.rs:94` `/// `ShioriRequest` モデル（GET / Sender / Charset / ID / Reference0..N）に一本化。`
- `src-tauri/src/shiori/wasm.rs:93` `return Ok("SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string());`
- `src-tauri/src/shiori/wasm.rs:96` `Ok("SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]WASM SHIORI 応答です。\\e\`
- `src-tauri/src/shiori/dynamic/request.rs:26` `"SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: {}\r\n\r\n",`
- `src-tauri/src/shiori/dynamic/request.rs:47` `return Ok("SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n".to_string());`

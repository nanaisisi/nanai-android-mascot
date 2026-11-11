# SHIORI/3.0 response: ErrorDescription [SSP拡張]

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: error_description
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/src/sstp/types.rs:49` `pub error_description: Option<String>,`
- `src-tauri/src/sstp/handler/request_processor.rs:37` `error_description: Some("COMMUNICATE disabled by ghost".to_string()),`
- `src-tauri/src/sstp/handler/request_processor.rs:51` `error_description: Some("receiver ghost not found".to_string()),`
- `src-tauri/src/sstp/handler/request_processor.rs:64` `error_description: Some("receiver ghost hwnd not found".to_string()),`
- `src-tauri/src/sstp/handler/request_processor.rs:80` `error_description: Some("Unspecified SEND disabled by ghost".to_string()),`

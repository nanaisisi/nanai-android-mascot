# SHIORI/3.0 response: Reference1～ (コミュニケート)

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: references
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/src/commands/ext.rs:145` `pub references: Vec<String>,`
- `src-tauri/src/commands/shiori/protocol.rs:99` `references: Option<Vec<String>>,`
- `src-tauri/src/commands/shiori/protocol.rs:102` `let mut req = ShioriRequest::get(&event, &references.unwrap_or_default());`
- `src-tauri/src/commands/shiori/protocol.rs:117` `references: Option<Vec<String>>,`
- `src-tauri/src/commands/shiori/protocol.rs:120` `let mut req = ShioriRequest::notify(&event, &references.unwrap_or_default());`

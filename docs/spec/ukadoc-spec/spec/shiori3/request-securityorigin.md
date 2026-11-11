# SHIORI/3.0 request: SecurityOrigin [SSP拡張]

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: SecurityOrigin
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/shiori/protocol/request/builder.rs:27` `"SecurityOrigin: {}\r\n",`
- `crates/ui/src/shiori/protocol/request/tests.rs:203` `assert!(built.contains("SecurityOrigin: localhost"));`
- `crates/ui/src/shiori/protocol/request/tests.rs:209` `assert!(req.build().contains("SecurityOrigin: null"));`
- `crates/ui/src/shiori/tests/protocol_extended_tests.rs:31` `assert!(wire.contains("SecurityOrigin: file://dummy\r\n"));`
- `crates/ui/src/shiori/tests/request_tests.rs:23` `assert!(text.contains("SecurityOrigin: null\r\n"));`

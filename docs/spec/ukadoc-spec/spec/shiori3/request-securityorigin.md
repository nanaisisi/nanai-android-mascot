# SHIORI/3.0 request: SecurityOrigin [SSP拡張]

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: SecurityOrigin
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/shiori/mod.rs:5` `//! SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify /`
- `crates/ui/src/shiori/protocol/request/types.rs:18` `/// `SecurityOrigin: null`（情報なし）とヘッダ省略を区別するため `Some(None)` で表現`
- `crates/ui/src/shiori/protocol/request/builder.rs:27` `"SecurityOrigin: {}\r\n",`
- `crates/ui/src/shiori/protocol/request/tests.rs:99` `let text_null = "GET SHIORI/3.0\r\nID: OnTest\r\nSecurityOrigin: null\r\n\r\n";`
- `crates/ui/src/shiori/protocol/request/tests.rs:109` `let text_url = "GET SHIORI/3.0\r\nID: OnTest\r\nSecurityOrigin: https://example.`

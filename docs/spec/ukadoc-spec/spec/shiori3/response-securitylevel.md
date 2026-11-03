# SHIORI/3.0 response: SecurityLevel [SSP拡張]

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: security_level
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/src/sstp/types.rs:13` `pub security_level: Option<String>,`
- `src-tauri/src/sstp/parser.rs:20` `security_level: core_req.security_level,`
- `src-tauri/src/sstp/parser.rs:47` `security_level: core_req.security_level,`
- `src-tauri/src/sstp/mod.rs:112` `security_level: Some("local".to_string()),`
- `crates/ui/src/sstp/message/request/core.rs:20` `pub security_level: Option<String>,`

# SHIORI/3.0 request: SenderType [SSP拡張]

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: SenderType
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/lib.rs:33` `MultiStageShioriLoader, SecurityLevel, SenderTypeTag, ShioriEngine, ShioriEngine`
- `crates/ui/src/shiori/mod.rs:4` `//! の構築・解析を行う。SSP 拡張ヘッダ（SenderType / SecurityLevel /`
- `crates/ui/src/shiori/mod.rs:22` `ErrorLevel, GhostStatusToken, SecurityLevel, SenderTypeTag, ShioriMethod, Status`
- `crates/ui/src/shiori/protocol/request/types.rs:15` `pub sender_type: Vec<SenderTypeTag>,`
- `crates/ui/src/shiori/protocol/request/builder.rs:20` `out.push_str(&format!("SenderType: {}\r\n", tokens));`

# SHIORI/3.0 request: Reference*

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: Reference
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/shiori/protocol/request/builder.rs:42` `out.push_str(&format!("Reference{}: {}\r\n", i, r));`
- `crates/ui/src/shiori/protocol/response/build.rs:54` `out.push_str(&format!("Reference{}: {}\r\n", i + 1, r));`
- `crates/ui/src/sstp/builder/execute_handler/mod.rs:32` `while let Some(val) = ctx.references.get(&format!("Reference{}", idx)) {`
- `crates/ui/src/sstp/message/request/parser.rs:145` `format!("Reference{}", &key[8..])`
- `crates/ui/src/sstp/message/response/parse.rs:84` `format!("Reference{}", &key[8..])`

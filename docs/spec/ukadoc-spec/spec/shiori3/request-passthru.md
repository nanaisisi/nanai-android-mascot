# SHIORI/3.0 request: X-SSTP-PassThru-*

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: X-SSTP-PassThru
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/shiori/protocol/request/builder.rs:45` `out.push_str(&format!("X-SSTP-PassThru-{}: {}\r\n", suffix, value));`
- `crates/ui/src/shiori/protocol/request/parser.rs:67` `} else if let Some(rest) = key.strip_prefix("X-SSTP-PassThru-") {`
- `crates/ui/src/shiori/protocol/request/tests.rs:161` `let text = "GET SHIORI/3.0\r\nID: OnEvent\r\nX-SSTP-PassThru-CustomParam: test_v`
- `crates/ui/src/shiori/protocol/request/tests.rs:206` `assert!(built.contains("X-SSTP-PassThru-CustomKey: CustomVal"));`
- `crates/ui/src/shiori/protocol/response/build.rs:63` `out.push_str(&format!("X-SSTP-PassThru-{}: {}\r\n", suffix, value));`

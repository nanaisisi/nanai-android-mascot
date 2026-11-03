# SHIORI/3.0 response: X-SSTP-PassThru-*

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: X-SSTP-PassThru
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/shiori/mod.rs:5` `//! SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify /`
- `crates/ui/src/shiori/protocol/response/build.rs:63` `out.push_str(&format!("X-SSTP-PassThru-{}: {}\r\n", suffix, value));`
- `crates/ui/src/shiori/protocol/response/build.rs:104` `assert!(built.contains("X-SSTP-PassThru-PassKey: PassVal"));`
- `crates/ui/src/shiori/protocol/response/mod.rs:50` `/// `X-SSTP-PassThru-(後続)` → 値（複数指定可能）`
- `crates/ui/src/shiori/protocol/response/mod.rs:82` `let key = key.strip_prefix("X-SSTP-PassThru-")?;`

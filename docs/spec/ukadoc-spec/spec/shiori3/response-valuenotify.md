# SHIORI/3.0 response: ValueNotify [SSP拡張]

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: value_notify
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/shiori/protocol/response/build.rs:28` `if let Some(value) = &self.value_notify {`
- `crates/ui/src/shiori/protocol/response/build.rs:79` `res.value_notify = Some("NotifyScript".into());`
- `crates/ui/src/shiori/protocol/response/mod.rs:24` `pub value_notify: Option<String>,`
- `crates/ui/src/shiori/protocol/response/mod.rs:93` `Some("value_notify") => {`
- `crates/ui/src/shiori/protocol/response/mod.rs:94` `if let Some(v) = res.value_notify.take() {`

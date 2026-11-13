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

- `crates/nanai-core/src/shiori_protocol.rs:40` `references: &[String],`
- `src-tauri/src/commands/ext.rs:145` `pub references: Vec<String>,`
- `ui/assets/LICENSE-3RD-PARTY.html:9603` `any references to the name of the license steward (except to note that`
- `ui/ts/ui/renderers/modal-dialog-communication.ts:81` `...opts.references,`
- `tests/balloon-events.test.ts:8` `const sentEvents: Array<{ event: string; references: string[] }> = [];`
- `crates/nanai-core/src/shiori_protocol.rs:68` `for (i, r) in references.iter().enumerate() {`

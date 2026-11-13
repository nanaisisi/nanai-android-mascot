# SHIORI/3.0 response: Reference0 (コミュニケート)

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: reference0
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/shiori/protocol/response/build.rs:50` `if let Some(r0) = &self.reference0 {`
- `src-tauri/src/sstp/types.rs:45` `pub reference0: Option<String>,`
- `ui/ts/core/actions/sstp-fmo-actions.ts:40` `reference0?: string;`
- `tests/e2e/cycle10-lifecycle.test.ts:52` `assert.equal(parsed.reference0, "Success");`
- `crates/ui/src/shiori/protocol/response/build.rs:85` `res.reference0 = Some("Ref0Val".into());`
- `src-tauri/src/sstp/handler/request_processor.rs:35` `reference0: None,`

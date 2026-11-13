# SHIORI/3.0 response: Sender

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: sender
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:29` `pub sender: Option<String>,`
- `src-tauri/src/commands/shiori/protocol.rs:103` `req.sender = "NanaiMascot".to_string();`
- `ui/ts/core/actions/sstp-fmo-actions.ts:11` `sender: string;`
- `tests/e2e/cycle10-lifecycle.test.ts:19` `sender: "NanaiE2ECycle10",`
- `crates/nanai-core/src/shiori_protocol.rs:52` `p.sender.unwrap_or_else(|| "Nanai".to_string()),`
- `src-tauri/src/commands/shiori/protocol.rs:121` `req.sender = "NanaiMascot".to_string();`

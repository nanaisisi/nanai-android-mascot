# SHIORI/3.0 request: Sender

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: Sender
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:51` `"Sender".to_string(),`
- `src-tauri/src/shiori/saori.rs:155` `headers.insert("Sender".to_string(), "Nanai-SAORI-Host".to_string());`
- `ui/ts/core/actions/sstp-fmo-actions.ts:220` `lines.push(`Sender: ${payload.sender || "Unknown"}`);`
- `tests/e2e/cycle10-lifecycle.test.ts:30` `assert.ok(rawRequest.includes("Sender: NanaiE2ECycle10\r\n"));`
- `crates/nanai-core/src/shiori_protocol.rs:402` `assert!(req.contains("Sender: SSP"));`
- `src-tauri/src/sstp/handler/request_processor.rs:25` `"📨 [SSTP/1.1] Method: {}, Sender: {}",`

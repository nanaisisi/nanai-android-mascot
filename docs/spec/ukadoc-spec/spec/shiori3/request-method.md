# SHIORI/3.0 request: メソッド (GET / NOTIFY)

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: SHIORI/3.0
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:1` `//! SHIORI/3.0 プロトコルリクエスト・イベント通知構築エンジン (UKADOC / SSP 準拠)`
- `src-tauri/shiori-host/src/main.rs:48` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`
- `ui/ts/ghost/shiori-notify.ts:3` `* @brief UKADOC notify イベント群 (SHIORI/3.0 NOTIFY コマンド)`
- `tests/shiori-worker.test.ts:67` `payload: { request: "GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n" },`
- `crates/nanai-core/src/shiori_protocol.rs:11` `pub version: String, // SHIORI/3.0`
- `src-tauri/shiori-host/src/main.rs:220` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`

# SHIORI/3.0 request: ID

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: ID:
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/src/commands/shiori/protocol.rs:60` `let noisy = request.contains("ID: OnSecondChange");`
- `src-tauri/src/sstp/mod.rs:46` `let raw = "SEND SSTP/1.4\r\nSender: TestApp\r\nID: unique_id_01\r\nOption: nobre`
- `crates/nanai-shiori-vm/src/lib.rs:32` `if request.contains("ID: version") {`
- `crates/nanai-shiori-vm/src/lib.rs:36` `if request.contains("ID: name") {`
- `crates/nanai-shiori-vm/src/lib.rs:40` `if request.contains("ID: OnBoot") {`

# SHIORI/3.0 response: Marker [SSP拡張]

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: marker
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/nanai-vfs/src/mock/mutations.rs:44` `let marker = format!("{}/.keep", norm);`
- `crates/nanai-vfs/src/mock/mutations.rs:45` `if !self.exists(&marker) {`
- `crates/nanai-vfs/src/mock/mutations.rs:46` `self.add_file(marker, Vec::new());`
- `crates/ui/src/shiori/engine/state.rs:34` `"response.marker".to_string(),`
- `crates/ui/src/shiori/engine/tests/mock_engine.rs:52` `assert!(refs.iter().any(|r| r == "response.marker"));`

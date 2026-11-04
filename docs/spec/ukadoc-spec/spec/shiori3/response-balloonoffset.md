# SHIORI/3.0 response: BalloonOffset [SSP拡張]

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: balloon_offset
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/src/lib.rs:141` `commands::window::set_balloon_offset,`
- `src-tauri/src/lib.rs:143` `commands::window::save_balloon_offset_from_position,`
- `src-tauri/src/commands/window/balloon_window/position.rs:2` `pub async fn set_balloon_offset(`
- `src-tauri/src/commands/window/balloon_window/position.rs:9` `state.balloon_offsets.lock().insert(scope_id, (x, y));`
- `src-tauri/src/commands/window/balloon_window/position.rs:31` `.balloon_offsets`

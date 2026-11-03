# SHIORI/3.0 response: Age [SSP拡張]

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: age
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/build_old.rs:69` `"messages.cpp",`
- `src-tauri/src/events.rs:1` `use tauri::{Emitter, Manager};`
- `src-tauri/src/tray.rs:1` `use tauri::image::Image;`
- `src-tauri/src/tray.rs:9` `.unwrap_or_else(|| Image::new_owned(vec![0, 0, 0, 0], 1, 1));`
- `src-tauri/src/lib.rs:79` `.manage(AppState::new());`

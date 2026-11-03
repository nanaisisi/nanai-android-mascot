# SHIORI/3.0 response: Marker [SSP拡張]

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: marker
- **対応状況**: ✅ 実装済

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings.rs:75` `"autoscroll" | "balloonalign" | "balloonmarker" | "balloonnum" | "balloonwait"`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings.rs:107` `pub(crate) fn handle_marker(callback: &mut dyn FnMut(SakuraCommand)) {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings.rs:156` `handle_marker(&mut cb);`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/mod.rs:42` `settings::handle_marker(callback);`
- `crates/ui/src/shiori/protocol/response/build.rs:34` `if let Some(marker) = &self.marker {`

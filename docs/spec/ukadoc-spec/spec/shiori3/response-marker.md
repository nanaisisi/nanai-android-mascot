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

- `crates/nanai-core/src/balloon_descript.rs:99` `self.get("marker.filename")`
- `ui/ts/core/actions/balloon-descript/assets.ts:190` `setBalloonImage("marker.filename", "--balloon-marker-image");`
- `ui/css/balloon-window.css:251` `.clickwait-marker {`
- `tests/balloon-display-enhancements.test.ts:9` `it("inserts clickwait marker during pause and removes it afterwards", async () =`
- `crates/nanai-core/src/balloon_descript.rs:161` `let content = "arrow.filename,arrow.png\nmarker.filename=marker.png\nclickwaitma`
- `ui/ts/ghost/sakura-rust-bridge.ts:184` `tokens.push({ type: "command", command: "marker", args: [] });`

# SHIORI/3.0 response: BalloonOffset [SSP拡張]

- **規格**: [response.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/response/) (ukadoc-spec/spec/shiori3/response.md)
- **検索語**: balloon_offset
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `crates/ui/src/shiori/protocol/response/build.rs:47` `if let Some((x, y)) = self.balloon_offset {`
- `crates/ui/src/shiori/protocol/response/build.rs:84` `res.balloon_offset = Some((10, 20));`
- `crates/ui/src/shiori/protocol/response/mod.rs:37` `pub balloon_offset: Option<(i32, i32)>,`
- `crates/ui/src/shiori/protocol/response/parse/core.rs:67` `res.balloon_offset = value.split_once(',').and_then(|(x, y)| {`
- `crates/ui/src/shiori/protocol/response/parse/tests.rs:80` `assert_eq!(res.balloon_offset, Some((12, -4)));`

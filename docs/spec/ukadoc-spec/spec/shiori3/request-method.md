# SHIORI/3.0 request: メソッド (GET / NOTIFY)

- **規格**: [request.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/request/) (ukadoc-spec/spec/shiori3/request.md)
- **検索語**: SHIORI/3.0
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 通信層として `crates/ui/src/shiori.rs`（SHIORI/3.0 リクエスト/レスポンス モデル・ビルダー・パーサー）で実装。SSP 拡張ヘッダ（SenderType / SecurityLevel / SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify / Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age / MarkerSend）を serde モデル + CR+LF 直列化に対応。34 ユニットテストでサンプル突合確認済み。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/shiori-host/src/main.rs:46` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`
- `src-tauri/shiori-host/src/main.rs:218` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`
- `src-tauri/src/commands/shiori/protocol.rs:48` `/// SHIORIにリクエストを送信（SHIORI/3.0 プロトコル準拠）`
- `src-tauri/src/shiori/cpp.rs:5` `* FFI経由でSHIORI/3.0プロトコルを実装する`
- `src-tauri/src/shiori/cpp.rs:20` `// SHIORI/3.0標準関数（YAYA C++実装）`

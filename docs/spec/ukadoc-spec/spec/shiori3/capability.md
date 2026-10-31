# SHIORI/3.0 capability: 実装対応状況の検知

- **規格**: [capability.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/capability/) (ukadoc-spec/spec/shiori3/capability.md)
- **対応状況**: ✅ 実装済

## 突合結果

SHIORI/3.0 プロトコルの Capability 系ヘッダ（`Sender`, `Charset`, `ID`, 参照引数 `Reference*`、`GET` / `NOTIFY` メソッド）の構築・送受信処理を完備 (`src-tauri/src/shiori/ffi/builder.rs`, `src-tauri/src/commands/shiori/protocol.rs`)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:1` `pub struct ShioriRequestBuilder`
- `src-tauri/src/commands/shiori/protocol.rs`

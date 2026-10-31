# update-file : updates2.dau (Version 2)

- **規格**: [updates2dau.md](https://ukatech.shillest.net/ukadoc-spec/spec/update-file/updates2dau/) (ukadoc-spec/spec/update-file/updates2dau.md)
- **対応状況**: ✅ 実装済

## 突合結果

`parse_update_definition` による `updates2.dau` のパースおよび MD5 ハッシュ検証機能の実装を完備 (`src-tauri/src/commands/update/dau.rs`)。

## 実装箇所

- `src-tauri/src/commands/update/dau.rs:3` `pub use nanai_android_mascot_ui::{UpdateEntry, parse_update_definition};`

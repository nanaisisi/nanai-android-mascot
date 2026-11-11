# update-file : 生成処理

- **規格**: [generation.md](https://ukatech.shillest.net/ukadoc-spec/spec/update-file/generation/) (ukadoc-spec/spec/update-file/generation.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

`generate_updates2_dau` Tauri コマンドおよび `WalkDir` による再帰的ファイル走査、隠しファイル・`developer_options.txt` の `noupdate` フィルタリング、MD5 ハッシュ計算・サイズ付与による `updates2.dau` 生成処理を実装 (`src-tauri/src/commands/update/generation.rs`)。

## 実装箇所

- `src-tauri/src/commands/update/mod.rs:2` `pub mod generation;`
- `src-tauri/src/commands/update/mod.rs:7` `pub use generation::*;`

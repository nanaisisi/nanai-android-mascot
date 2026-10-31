# update-file : 生成処理

- **規格**: [generation.md](https://ukatech.shillest.net/ukadoc-spec/spec/update-file/generation/) (ukadoc-spec/spec/update-file/generation.md)
- **対応状況**: ✅ 実装済

## 突合結果

`generate_updates2_dau` Tauri コマンドおよび `WalkDir` による再帰的ファイル走査、隠しファイル・`developer_options.txt` の `noupdate` フィルタリング、MD5 ハッシュ計算・サイズ付与による `updates2.dau` 生成処理を実装 (`src-tauri/src/commands/update/generation.rs`)。

## 実装箇所

- `src-tauri/src/commands/update/generation.rs:1` `//! Update definition generation implementation (updates2.dau / updates.txt)`
- `src-tauri/src/commands/update/generation.rs:2` `//! spec/update-file/generation.md 準拠`
- `src-tauri/src/commands/update/mod.rs:3` `pub mod generation;`
- `src-tauri/src/commands/update/mod.rs:8` `pub use generation::*;`
- `ui/js/ghost/ghost.js:164` `const generation = this._ghostLoadGeneration;`

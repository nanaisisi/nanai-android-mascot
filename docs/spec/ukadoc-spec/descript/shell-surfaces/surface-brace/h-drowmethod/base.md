# base

- **規格**: [base.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/base/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/base.md)
- **検索語**: base
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/file.rs:44` `let base_ghost_path =`
- `src-tauri/src/commands/file.rs:47` `let shell_dir = base_ghost_path.join("shell").join(&shell_name);`
- `src-tauri/src/commands/file.rs:48` `let master_dir = base_ghost_path.join("shell").join("master");`
- `src-tauri/src/commands/file.rs:102` `use base64::Engine;`
- `src-tauri/src/commands/file.rs:103` `let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);`

# start,ID

- **規格**: [start.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/start/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/start.md)
- **検索語**: start
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/build.rs:20` `if !target.contains("windows") || !target.starts_with("x86_64") {`
- `src-tauri/src/commands/ext.rs:29` `if !dir_name.starts_with('.') {`
- `src-tauri/src/commands/ext.rs:78` `if !dir_name.starts_with('.') {`
- `src-tauri/src/commands/window/character_window.rs:137` `if label.starts_with("subchar_window_") {`
- `src-tauri/src/commands/update/network.rs:36` `if normalized.is_empty() || normalized.starts_with('/') {`

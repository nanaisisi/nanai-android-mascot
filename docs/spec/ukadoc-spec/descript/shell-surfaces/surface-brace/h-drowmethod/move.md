# move

- **規格**: [move.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/move/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/move.md)
- **検索語**: move
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/build.rs:34` `.env_remove("CARGO_ENCODED_RUSTFLAGS")`
- `src-tauri/build.rs:35` `.env_remove("RUSTFLAGS")`
- `src-tauri/build.rs:36` `.env_remove("CARGO_BUILD_TARGET")`
- `src-tauri/build.rs:37` `.env_remove("TARGET")`
- `src-tauri/src/events.rs:24` `tauri::async_runtime::spawn(async move {`

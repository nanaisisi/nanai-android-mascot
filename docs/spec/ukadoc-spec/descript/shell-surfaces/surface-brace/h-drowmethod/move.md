# move

- **規格**: [move.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/move/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/move.md)
- **検索語**: move
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/build.rs:34` `.env_remove("CARGO_ENCODED_RUSTFLAGS")`
- `src-tauri/build.rs:35` `.env_remove("RUSTFLAGS")`
- `src-tauri/build.rs:36` `.env_remove("CARGO_BUILD_TARGET")`
- `src-tauri/build.rs:37` `.env_remove("TARGET")`
- `src-tauri/src/events.rs:24` `tauri::async_runtime::spawn(async move {`

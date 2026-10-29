# 相対パス,ignore

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/updates_def-txt/entry/) (ukadoc-spec/descript/install/updates_def-txt/entry.md)
- **検索語**: ignore
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「ignore」を確認。


## 実装箇所

- `src-tauri/src/lib.rs:47` `.header("// deno-lint-ignore-file no-explicit-any\n// biome-ignore-all lint/susp`
- `src-tauri/src/commands/install/archive.rs:175` `&& relative_path[..src_prefix.len()].eq_ignore_ascii_case(src_prefix)`
- `src-tauri/src/ghost/scan/directory.rs:50` `if path.join(".dev_ignore").exists() {`
- `src-tauri/src/ghost/scan/directory.rs:51` `println!("🚫 Skipping ghost directory with .dev_ignore: {:?}", path);`
- `src-tauri/src/shiori/ffi/builder.rs:20` `if method.eq_ignore_ascii_case("NOTIFY") {`

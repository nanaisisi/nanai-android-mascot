# 相対パス,ignore

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/updates_def-txt/entry/) (ukadoc-spec/descript/install/updates_def-txt/entry.md)
- **検索語**: ignore
- **対応状況**: ✅ 対応済

## 突合結果

`crates/ui/src/update.rs` (`parse_update_definition`) においてネットワーク更新定義 (`updates_def.txt` / `updates2.dau`) 内の相対パス行および `ignore`, `readonly`, `delete`, `size=` オプションフラグを自動解析・処理する実装が行われている。

## 実装箇所

- `src-tauri/src/lib.rs:49` `.header("// deno-lint-ignore-file no-explicit-any\n// biome-ignore-all lint/susp`
- `src-tauri/src/commands/install/archive.rs:211` `&& relative_path[..src_prefix.len()].eq_ignore_ascii_case(src_prefix)`
- `src-tauri/src/ghost/scan/directory.rs:51` `// [.narignore / .updateignore / .narinclude / .updateinclude]: アーカイブ・更新除外および開発無`
- `src-tauri/src/ghost/scan/directory.rs:52` `if path.join(".dev_ignore").exists()`
- `src-tauri/src/ghost/scan/directory.rs:53` `|| path.join(".narignore").exists()`

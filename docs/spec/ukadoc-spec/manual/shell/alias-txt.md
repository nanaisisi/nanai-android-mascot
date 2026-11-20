# `alias.txt`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: alias.txt
- **対応状況**: ✅ 実装済

## 突合結果

単独ファイル `alias.txt`（`sakura.surface.alias` / `kero.surface.alias` / `char*.surface.alias` セクション、および `sakura.alias` / `kero.alias` / `char*.alias`）を読み込むパーサを実装済み（現行仕様として `surfaces.txt` 内に統合された `surface.alias` / `sakura.alias` / `kero.alias` ブロックの解決も `crates/ui/src/shell/core.rs:89` 等で実装済み）。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/alias.rs`: `ShellAliasTable`, `parse_alias_txt`, `read_alias_file`, `read_shell_alias_txt`
- `src-tauri/src/ghost/scan/shell/mod.rs`: `pub mod alias;`

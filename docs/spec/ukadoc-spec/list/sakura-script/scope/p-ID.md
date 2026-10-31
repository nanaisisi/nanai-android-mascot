# \p[ID番号]

- **規格**: [p-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/scope/p-ID/) (ukadoc-spec/list/sakura-script/scope/p-ID.md)
- **検索語**: \p
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: スコープ指定 \p[n]。

## 実装箇所

- `src-tauri/src/common/paths.rs:180` `clean_verbatim_path(r"\\?\C:\path\to\file"),`
- `src-tauri/src/common/paths.rs:181` `r"C:\path\to\file"`
- `crates/ui/src/lib.rs:155` `let script_ps = r"\p[2]\p3\_s[1]同期\_s[0]非同期";`
- `crates/ui/src/script/command.rs:7` `Target(u8),   // \0, \1, \p[n]`
- `crates/ui/src/script/parser/mod.rs:34` `// \p[N]`

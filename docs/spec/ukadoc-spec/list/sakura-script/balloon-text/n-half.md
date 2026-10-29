# \n[half]

- **規格**: [n-half.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/n-half/) (ukadoc-spec/list/sakura-script/balloon-text/n-half.md)
- **検索語**: \n
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: 改行 (\n[half] も対応)。


## 実装箇所

- `src-tauri/src/lib.rs:47` `.header("// deno-lint-ignore-file no-explicit-any\n// biome-ignore-all lint/susp`
- `src-tauri/src/commands/shiori/protocol.rs:63` `"📤 [Rust] SHIORI request (ghost: {}):\n{}",`
- `src-tauri/src/commands/shiori/protocol.rs:75` `"📥 [Rust] SHIORI response (ghost: {}):\n{}",`
- `src-tauri/src/commands/shell/ghost.rs:25` `"ゴースト「{name}」をアンインストールしますか？\nゴーストのファイルはすべて削除されます（復元できません）。"`
- `src-tauri/src/shiori/dynamic/mod.rs:161` `let wrapped = format!("SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: {}\r\n\r\n"`

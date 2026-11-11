# ショートカット一覧

- **規格**: [functions/shortcut.md](https://ukatech.shillest.net/ukadoc-ssp/functions/shortcut/) (ukadoc-ssp/functions/shortcut.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

R, T, U, C, M, S, B, O, G, W, X など標準キーバインド実装

## 実装箇所

- `crates/ui/src/script/parser/tests.rs:41` `\\![create,shortcut]\`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:75` `if parts.get(1).is_some_and(|p| p == "shortcut") {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:206` `handle_create(&["create".to_string(), "shortcut".to_string()], &mut cb);`
- `ui/menu-iframe.html:28` `<span>こうしん</span><span class="shortcut-key">Ctrl+U</span>`
- `ui/css/context-menu.css:173` `.shortcut-key {`

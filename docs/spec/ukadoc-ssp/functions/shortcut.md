# ショートカット一覧

- **規格**: [functions/shortcut.md](https://ukatech.shillest.net/ukadoc-ssp/functions/shortcut/) (ukadoc-ssp/functions/shortcut.md)
- **対応状況**: ✅ 実装済

## 突合結果

R, T, U, C, M, S, B, O, G, W, X など標準キーバインド実装

## 実装箇所

- `crates/ui/src/script/parser/tests.rs:41` `\\![create,shortcut]\`
- `ui/menu-iframe.html:31` `<span>こうしん</span><span class="shortcut-key">Ctrl+U</span>`
- `tests/menu-renderer.test.ts:116` `shortcut: "Ctrl+T",`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:75` `if parts.get(1).is_some_and(|p| p == "shortcut") {`
- `ui/menu-iframe.html:127` `<span>終了(<u>W</u>)</span><span class="shortcut-key">Ctrl+W</span>`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:206` `handle_create(&["create".to_string(), "shortcut".to_string()], &mut cb);`

# ショートカット一覧

- **規格**: [functions/shortcut.md](https://ukatech.shillest.net/ukadoc-ssp/functions/shortcut/) (ukadoc-ssp/functions/shortcut.md)
- **対応状況**: ✅ 実装済

## 突合結果

R, T, U, C, M, S, B, O, G, W, X など標準キーバインド実装

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:159` `if parts.get(1).is_some_and(|p| *p == "shortcut") {`
- `ui/menu-iframe.html:348` `<span class="shortcut-key">Ctrl+I</span>`
- `ui/menu-iframe.html:354` `<span class="shortcut-key">Ctrl+W</span>`
- `ui/menu-iframe.html:366` `<span class="shortcut-key">Ctrl+Q</span>`
- `ui/css/context-menu.css:120` `.shortcut-key {`

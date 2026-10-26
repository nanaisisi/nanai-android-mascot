# scope,数値

- **規格**: [scope.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/scope/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/scope.md)
- **検索語**: scope
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「scope」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:10`  `scope: Option<i32>,`
- `src-tauri/src/commands/window/menu_window.rs:15`  `let menu_scope = scope.unwrap_or(0);`
- `src-tauri/src/commands/window/menu_window.rs:18`  `let win_height = if menu_scope > 0 { 420.0 } else { 540.0 };`
- `src-tauri/src/commands/window/menu_window.rs:49`  `let _ = menu_win.emit("sync-menu-scope", menu_scope);`
- `src-tauri/src/commands/window/menu_window.rs:54`  `tauri::WebviewUrl::App(format!("menu-iframe.html?scope={}", menu_scope).into()),`

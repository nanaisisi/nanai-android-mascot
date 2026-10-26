# scope,数値

- **規格**: [scope.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/scope/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/scope.md)
- **検索語**: scope
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「scope」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:10`  `scope: Option<i32>,`
- `src-tauri/src/commands/window/menu_window.rs:15`  `let menu_scope = scope.unwrap_or(0);`
- `src-tauri/src/commands/window/menu_window.rs:18`  `let win_height = if menu_scope > 0 { 420.0 } else { 540.0 };`
- `src-tauri/src/commands/window/menu_window.rs:49`  `let _ = menu_win.emit("sync-menu-scope", menu_scope);`
- `src-tauri/src/commands/window/menu_window.rs:54`  `tauri::WebviewUrl::App(format!("menu-iframe.html?scope={}", menu_scope).into()),`

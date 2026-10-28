# menu

- **規格**: [menu.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/menu/)
- **検索語**: menu
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「menu」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:6` `pub async fn show_menu_window(`
- `src-tauri/src/commands/window/menu_window.rs:15` `let menu_scope = scope.unwrap_or(0);`
- `src-tauri/src/commands/window/menu_window.rs:18` `let win_height = if menu_scope > 0 { 420.0 } else { 540.0 };`
- `src-tauri/src/commands/window/menu_window.rs:38` `if let Some(menu_win) = app_handle.get_webview_window("menu_window") {`
- `src-tauri/src/commands/window/menu_window.rs:39` `let _ = menu_win.set_size(tauri::Size::Logical(tauri::LogicalSize {`

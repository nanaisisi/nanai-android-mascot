# menu,hidden

- **規格**: [menu.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu/) (ukadoc-spec/descript/shell/descript-txt/menu.md)
- **検索語**: menu
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所\n\n- src-tauri/src/ghost/scan/shell.rs // [name,シェル名]... [type,種別]... [char*.name,名前]...

## 突合結果

ヒットしたのは一般的な語「menu」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/events.rs:4` `pub fn handle_menu_event(app_handle: &tauri::AppHandle, event: tauri::menu::Menu`
- `src-tauri/src/events.rs:8` `"native-menu-action",`
- `src-tauri/src/events.rs:16` `"native-menu-action",`
- `src-tauri/src/events.rs:22` `} else if id == "open" || id == "open_menu" {`
- `src-tauri/src/events.rs:35` `let _ = crate::commands::window::show_menu_window(app_h, x, y, Some(0)).await;`

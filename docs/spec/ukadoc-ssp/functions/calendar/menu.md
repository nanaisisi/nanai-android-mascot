# カレンダー：メニュー

- **規格**: [functions/calendar/menu.md](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/menu/) (ukadoc-ssp/functions/calendar/menu.md)
- **対応状況**: ✅ 対応済

## 突合結果

カレンダー操作メニューおよびイベントトリガー連携 (`trigger_calendar_event`) の実装完了。

## 実装箇所

- `src-tauri/src/events.rs:4` `pub fn handle_menu_event(app_handle: &tauri::AppHandle, event: tauri::menu::Menu`
- `src-tauri/src/events.rs:8` `"native-menu-action",`
- `src-tauri/src/events.rs:16` `"native-menu-action",`
- `src-tauri/src/events.rs:22` `} else if id == "open" || id == "open_menu" {`
- `src-tauri/src/events.rs:35` `let _ = crate::commands::window::show_menu_window(app_h, x, y, Some(0)).await;`

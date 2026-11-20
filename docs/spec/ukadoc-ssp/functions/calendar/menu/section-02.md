# 予定を読む

- **規格**: [calendar/menu.md](../../../../../../docs/ukadoc-ssp/functions/calendar/menu.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/menu/))
- **対応状況**: ✅ 実装済

## 突合結果

docs/ukadoc-ssp/functions/calendar/menu.md の「予定を読む」に関する仕様項目。 カレンダー操作メニューおよびイベントトリガー連携 (`trigger_calendar_event`) の実装完了。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:112` `self.get("menu.background.bitmap.filename")`
- `src-tauri/src/events.rs:4` `pub fn handle_menu_event(app_handle: &tauri::AppHandle, event: tauri::menu::Menu`
- `ui/main.ts:25` `import { menuMethods } from "./ts/ui/app-menu.js";`
- `ui/index.html:32` `<div class="top-right-menu">`
- `tests/app-actions.test.ts:160` `handle("close-menu");`
- `crates/nanai-core/src/descript_parser.rs:113` `.or_else(|| self.get("menu.background.bitmap"))`

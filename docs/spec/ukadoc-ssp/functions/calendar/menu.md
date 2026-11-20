# カレンダー：メニュー

- **規格**: [calendar/menu.md](../../../../../docs/ukadoc-ssp/functions/calendar/menu.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/menu/))
- **対応状況**: ✅ 実装済

カレンダー操作メニューおよびイベントトリガー連携 (`trigger_calendar_event`) の実装完了。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [スケジュール編集](menu/section-01.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「スケジュール編集」 |
| [予定を読む](menu/section-02.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「予定を読む」 |
| [今日の予定](menu/section-03.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「今日の予定」 |
| [すべて削除](menu/section-04.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「すべて削除」 |
| [前月](menu/section-05.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「前月」 |
| [次月](menu/section-06.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「次月」 |
| [表示](menu/section-07.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「表示」 |
| [スキン](menu/section-08.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「スキン」 |
| [スケジュールセンサ](menu/section-09.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「スケジュールセンサ」 |
| [閉じる](menu/section-10.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/menu.md の「閉じる」 |

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:112` `self.get("menu.background.bitmap.filename")`
- `src-tauri/src/events.rs:4` `pub fn handle_menu_event(app_handle: &tauri::AppHandle, event: tauri::menu::Menu`
- `ui/main.ts:25` `import { menuMethods } from "./ts/ui/app-menu.js";`
- `ui/index.html:32` `<div class="top-right-menu">`
- `tests/app-actions.test.ts:160` `handle("close-menu");`
- `crates/nanai-core/src/descript_parser.rs:113` `.or_else(|| self.get("menu.background.bitmap"))`

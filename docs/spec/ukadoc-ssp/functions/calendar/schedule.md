# カレンダー：スケジュール編集

- **規格**: [functions/calendar/schedule.md](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/schedule/) (ukadoc-ssp/functions/calendar/schedule.md)
- **対応状況**: ✅ 対応済

## 突合結果

ゴースト発話によるスケジュール通知 (`OnSchedule5MinutesToGo`, `OnScheduleTodayNotify`) および `\![execute,schedule-add,...]` のパース・登録処理の実装完了。


## 実装箇所

- `src-tauri/src/lib.rs:162` `commands::calendar::get_schedules,`
- `src-tauri/src/lib.rs:163` `commands::calendar::add_schedule,`
- `src-tauri/src/lib.rs:164` `commands::calendar::delete_schedule,`
- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/calendar.rs:19` `fn get_schedules_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, Str`

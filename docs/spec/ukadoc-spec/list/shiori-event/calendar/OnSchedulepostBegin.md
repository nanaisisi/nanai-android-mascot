# OnSchedulepostBegin

- **規格**: [OnSchedulepostBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/calendar/OnSchedulepostBegin/) (ukadoc-spec/list/shiori-event/calendar/OnSchedulepostBegin.md)
- **検索語**: get_schedules
- **対応状況**: ✅ 実装済

## 突合結果

カレンダースケジュール関連イベント・機能を実装 (src-tauri/src/commands/calendar.rs -> get_schedules)。

## 実装箇所

- `src-tauri/src/lib.rs:165` `commands::calendar::get_schedules,`
- `src-tauri/src/commands/calendar.rs:19` `fn get_schedules_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, Str`
- `src-tauri/src/commands/calendar.rs:29` `pub async fn get_schedules(app_handle: tauri::AppHandle) -> Result<Vec<ScheduleI`
- `src-tauri/src/commands/calendar.rs:30` `let path = get_schedules_file_path(&app_handle)?;`
- `src-tauri/src/commands/calendar.rs:44` `let mut items = get_schedules(app_handle.clone()).await.unwrap_or_default();`

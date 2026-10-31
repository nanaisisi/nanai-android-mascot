# OnSchedulepostComplete

- **規格**: [OnSchedulepostComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/calendar/OnSchedulepostComplete/) (ukadoc-spec/list/shiori-event/calendar/OnSchedulepostComplete.md)
- **検索語**: OnSchedulepostComplete
- **対応状況**: ✅ 実装済

## 突合結果

OnSchedulepostComplete カレンダー/スケジュールSHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, src-tauri/src/commands/calendar.rs)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:5` `//! - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete`
- `ui/js/ghost/shiori-notify.js:21` `* - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete, OnSched`

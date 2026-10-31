# OnSchedulepostBegin

- **規格**: [OnSchedulepostBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/calendar/OnSchedulepostBegin/) (ukadoc-spec/list/shiori-event/calendar/OnSchedulepostBegin.md)
- **検索語**: OnSchedulepostBegin
- **対応状況**: ✅ 実装済

## 突合結果

OnSchedulepostBegin カレンダー/スケジュールSHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, src-tauri/src/commands/calendar.rs)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:5` `//! - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete`
- `ui/js/ghost/shiori-notify.js:21` `* - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete, OnSched`

# OnScheduleRead

- **規格**: [OnScheduleRead.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/calendar/OnScheduleRead/) (ukadoc-spec/list/shiori-event/calendar/OnScheduleRead.md)
- **検索語**: OnScheduleRead
- **対応状況**: ✅ 実装済

## 突合結果

OnScheduleRead カレンダー/スケジュールSHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, src-tauri/src/commands/calendar.rs)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:6` `//! - OnScheduleRead, OnSchedulesenseBegin, OnSchedulesenseComplete`
- `ui/js/ghost/shiori-notify.js:21` `* - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete, OnSched`

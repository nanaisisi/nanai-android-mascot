# OnSchedule5MinutesToGo

- **規格**: [OnSchedule5MinutesToGo.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/calendar/OnSchedule5MinutesToGo/) (ukadoc-spec/list/shiori-event/calendar/OnSchedule5MinutesToGo.md)
- **検索語**: OnSchedule5MinutesToGo
- **対応状況**: ✅ 実装済

## 突合結果

OnSchedule5MinutesToGo カレンダー/スケジュールSHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, src-tauri/src/commands/calendar.rs)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:5` `//! - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete`
- `ui/js/ghost/shiori-notify.js:21` `* - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete, OnSched`

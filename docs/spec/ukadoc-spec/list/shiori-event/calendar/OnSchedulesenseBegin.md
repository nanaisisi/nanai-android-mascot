# OnSchedulesenseBegin

- **規格**: [OnSchedulesenseBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/calendar/OnSchedulesenseBegin/) (ukadoc-spec/list/shiori-event/calendar/OnSchedulesenseBegin.md)
- **検索語**: OnSchedulesenseBegin
- **対応状況**: ✅ 実装済

## 突合結果

OnSchedulesenseBegin カレンダー/スケジュールSHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, src-tauri/src/commands/calendar.rs)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:6` `//! - OnScheduleRead, OnSchedulesenseBegin, OnSchedulesenseComplete`
- `ui/js/ghost/shiori-notify.js:22` `* - OnSchedulesenseBegin, OnSchedulesenseComplete, OnSchedulesenseFailure, OnSch`

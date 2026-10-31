# OnSchedulesenseFailure

- **規格**: [OnSchedulesenseFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/calendar/OnSchedulesenseFailure/) (ukadoc-spec/list/shiori-event/calendar/OnSchedulesenseFailure.md)
- **検索語**: OnSchedulesenseFailure
- **対応状況**: ✅ 実装済

## 突合結果

OnSchedulesenseFailure カレンダー/スケジュールSHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, src-tauri/src/commands/calendar.rs)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:7` `//! - OnSchedulesenseFailure, OnScheduleTodayNotify`
- `ui/js/ghost/shiori-notify.js:22` `* - OnSchedulesenseBegin, OnSchedulesenseComplete, OnSchedulesenseFailure, OnSch`

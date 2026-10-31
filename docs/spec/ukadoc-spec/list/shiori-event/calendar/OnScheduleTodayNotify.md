# OnScheduleTodayNotify

- **規格**: [OnScheduleTodayNotify.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/calendar/OnScheduleTodayNotify/) (ukadoc-spec/list/shiori-event/calendar/OnScheduleTodayNotify.md)
- **検索語**: OnScheduleTodayNotify
- **対応状況**: ✅ 実装済

## 突合結果

OnScheduleTodayNotify カレンダー/スケジュールSHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, src-tauri/src/commands/calendar.rs)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:7` `//! - OnSchedulesenseFailure, OnScheduleTodayNotify`
- `ui/js/ghost/shiori-notify.js:22` `* - OnSchedulesenseBegin, OnSchedulesenseComplete, OnSchedulesenseFailure, OnSch`

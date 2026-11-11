# カレンダー：スケジュール編集

- **規格**: [functions/calendar/schedule.md](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/schedule/) (ukadoc-ssp/functions/calendar/schedule.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

ゴースト発話によるスケジュール通知 (`OnSchedule5MinutesToGo`, `OnScheduleTodayNotify`) および `\![execute,schedule-add,...]` のパース・登録処理の実装完了。

## 実装箇所

- `crates/ui/src/script/command.rs:100` `}, // \![execute,schedule-add,...]`
- `crates/ui/src/script/parser/tests.rs:29` `\\![execute,schedule-add,2026-10-31,12:00,Meeting,Notes]\`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:4` `if parts.get(1).is_some_and(|p| p == "schedule-add") {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:134` `&["execute".to_string(), "schedule-add".to_string()],`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:140` `"schedule-add".to_string(),`

# \![execute,schedule-add,オプション,オプション,オプション...]

- **規格**: [bang-execute-schedule-add.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-schedule-add/) (ukadoc-spec/list/sakura-script/misc/bang-execute-schedule-add.md)
- **検索語**: schedule-add
- **対応状況**: ✅ 対応済

## 突合結果

`crates/ui/src/script/parser/brackets/handlers.rs` にて `\![execute,schedule-add,...]` のパースおよび `SakuraCommand::ScheduleAdd` への変換処理を実装。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/script/command.rs:56` `}, // \![execute,schedule-add,...]`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:23` `if parts.get(1).is_some_and(|p| *p == "schedule-add") {`

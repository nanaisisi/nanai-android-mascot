# \![execute,schedule-add,オプション,オプション,オプション...]

- **規格**: [bang-execute-schedule-add.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-schedule-add/) (ukadoc-spec/list/sakura-script/misc/bang-execute-schedule-add.md)
- **検索語**: ScheduleAdd
- **対応状況**: ✅ 実装済

## 突合結果

`\![execute,schedule-add,...]` (スケジュール追加) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::ScheduleAdd`)。

## 実装箇所

- `crates/ui/src/script/command.rs:75` `ScheduleAdd {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:28` `callback(SakuraCommand::ScheduleAdd {`

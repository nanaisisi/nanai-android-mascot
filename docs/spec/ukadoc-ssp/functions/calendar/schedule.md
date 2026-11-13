# カレンダー：スケジュール編集

- **規格**: [functions/calendar/schedule.md](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/schedule/) (ukadoc-ssp/functions/calendar/schedule.md)
- **対応状況**: ✅ 実装済

## 突合結果

ゴースト発話によるスケジュール通知 (`OnSchedule5MinutesToGo`, `OnScheduleTodayNotify`) および `\![execute,schedule-add,...]` のパース・登録処理の実装完了。

## 実装箇所

- `crates/ui/src/script/command.rs:100` `}, // \![execute,schedule-add,...]`
- `ui/ts/core/actions/menu-action-system.ts:36` `if (action === "calendar" || action === "schedule") {`
- `tests/parser-fuzzing/cycle10-syntax-fuzzing.test.ts:141` `["schedule-add"],`
- `crates/ui/src/script/parser/tests.rs:29` `\\![execute,schedule-add,2026-10-31,12:00,Meeting,Notes]\`
- `ui/ts/ghost/sakura-rust-bridge.ts:240` `tokens.push({ type: "command", command: "schedule-add", args: [] });`
- `tests/sakura-command-handler/cycle9-commands.test.ts:136` `it("handles execute commands (execute:*, execute,emptyrecyclebin, filewatch, pin`

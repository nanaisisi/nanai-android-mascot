# カレンダー：スケジュール編集

- **規格**: [calendar/schedule.md](../../../../../docs/ukadoc-ssp/functions/calendar/schedule.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/schedule/))
- **対応状況**: ✅ 実装済

ゴースト発話によるスケジュール通知 (`OnSchedule5MinutesToGo`, `OnScheduleTodayNotify`) および `\![execute,schedule-add,...]` のパース・登録処理の実装完了。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [\[yyyy/mm/dd\] スケジュール](schedule/section-01.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/schedule.md の「\[yyyy/mm/dd\] スケジュール」 |
| [必須項目](schedule/section-02.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/schedule.md の「必須項目」 |
| [オプション項目](schedule/section-03.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/schedule.md の「オプション項目」 |
| [ダイアログのボタン](schedule/section-04.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/schedule.md の「ダイアログのボタン」 |
| [スケジュールを投稿](schedule/section-05.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/calendar/schedule.md の「スケジュールを投稿」 |

## 実装箇所

- `crates/ui/src/script/command.rs:100` `}, // \![execute,schedule-add,...]`
- `ui/ts/core/actions/menu-action-system.ts:36` `if (action === "calendar" || action === "schedule") {`
- `tests/parser-fuzzing/cycle10-syntax-fuzzing.test.ts:141` `["schedule-add"],`
- `crates/ui/src/script/parser/tests.rs:29` `\\![execute,schedule-add,2026-10-31,12:00,Meeting,Notes]\`
- `ui/ts/ghost/sakura-rust-bridge.ts:240` `tokens.push({ type: "command", command: "schedule-add", args: [] });`
- `tests/sakura-command-handler/cycle9-commands.test.ts:136` `it("handles execute commands (execute:*, execute,emptyrecyclebin, filewatch, pin`

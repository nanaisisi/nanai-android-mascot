# %hour

- **規格**: [pct-hour.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-hour/) (ukadoc-spec/list/sakura-script/environment-variable/pct-hour.md)
- **検索語**: hour
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「hour」を確認。

## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:257` `pub hour: u32,`
- `src-tauri/src/commands/install/utils.rs:89` `+ (dt.hour() as u64) * 3_600`
- `ui/ts/ghost/command-handler/env.ts:155` `case "system.hour":`
- `ui/ts/ui/renderers/inputs/advanced/date-time-inputs.ts:182` `let hour = "";`
- `tests/sakura-command-handler/env-variables.test.ts:49` `"Date: %property[system.year]-%property[system.month]-%property[system.day] %pro`
- `crates/nanai-core/src/sakura_script.rs:271` `hour: 12,`

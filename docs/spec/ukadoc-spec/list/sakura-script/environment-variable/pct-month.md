# %month

- **規格**: [pct-month.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-month/) (ukadoc-spec/list/sakura-script/environment-variable/pct-month.md)
- **検索語**: month
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「month」を確認。

## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:255` `pub month: u32,`
- `src-tauri/src/commands/install/utils.rs:57` `let month = dt.month() as usize;`
- `ui/ts/ghost/command-handler/env.ts:151` `case "system.month":`
- `ui/ts/ui/renderers/inputs/advanced/date-time-inputs.ts:14` `let month = "";`
- `tests/sakura-command-handler/env-variables.test.ts:49` `"Date: %property[system.year]-%property[system.month]-%property[system.day] %pro`
- `crates/nanai-core/src/sakura_script.rs:269` `month: 10,`

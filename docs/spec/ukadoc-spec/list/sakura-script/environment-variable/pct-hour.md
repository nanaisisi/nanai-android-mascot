# %hour

- **規格**: [pct-hour.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-hour/) (ukadoc-spec/list/sakura-script/environment-variable/pct-hour.md)
- **検索語**: hour
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「hour」を確認。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:89` `+ (dt.hour() as u64) * 3_600`
- `src-tauri/src/shiori/property/tests.rs:25` `assert_eq!(evaluate_property_query("system.hour"), "12");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:60` `"system.hour" => "12",`
- `crates/ui/src/script/env.rs:38` `result = result.replace("%hour", "12");`
- `ui/ts/ghost/command-handler/env.ts:155` `case "system.hour":`

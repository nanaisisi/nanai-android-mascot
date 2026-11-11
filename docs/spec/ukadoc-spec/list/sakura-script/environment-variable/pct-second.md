# %second

- **規格**: [pct-second.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-second/) (ukadoc-spec/list/sakura-script/environment-variable/pct-second.md)
- **検索語**: second
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。



## 実装箇所

- `src-tauri/src/commands/install/utils.rs:91` `+ (dt.second() as u64);`
- `src-tauri/src/shiori/property/tests.rs:27` `assert_eq!(evaluate_property_query("system.second"), "0");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:62` `"system.second" => "0",`
- `crates/ui/src/script/env.rs:40` `result = result.replace("%second", "00");`
- `crates/ui/src/shiori/engine/tests/multistage_loader/fallback_reload/full_coverage.rs:111` `Err("second load failed".into())`

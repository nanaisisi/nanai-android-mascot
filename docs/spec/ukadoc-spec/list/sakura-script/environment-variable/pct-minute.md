# %minute

- **規格**: [pct-minute.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-minute/) (ukadoc-spec/list/sakura-script/environment-variable/pct-minute.md)
- **検索語**: minute
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。



## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:258` `pub minute: u32,`
- `src-tauri/src/commands/install/utils.rs:90` `+ (dt.minute() as u64) * 60`
- `ui/ts/ghost/command-handler/env.ts:157` `case "system.minute":`
- `tests/sakura-command-handler/env-variables.test.ts:49` `"Date: %property[system.year]-%property[system.month]-%property[system.day] %pro`
- `crates/nanai-core/src/sakura_script.rs:272` `minute: 0,`
- `src-tauri/src/shiori/property/tests.rs:26` `assert_eq!(evaluate_property_query("system.minute"), "0");`

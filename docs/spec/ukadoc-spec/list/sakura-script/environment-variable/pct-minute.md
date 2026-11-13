# %minute

- **規格**: [pct-minute.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-minute/) (ukadoc-spec/list/sakura-script/environment-variable/pct-minute.md)
- **検索語**: minute
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。



## 実装箇所

- `src-tauri/src/commands/install/utils.rs:90` `+ (dt.minute() as u64) * 60`
- `src-tauri/src/shiori/property/tests.rs:26` `assert_eq!(evaluate_property_query("system.minute"), "0");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:61` `"system.minute" => "0",`
- `crates/nanai-core/src/sakura_script.rs:253` `pub minute: u32,`
- `crates/nanai-core/src/sakura_script.rs:267` `minute: 0,`

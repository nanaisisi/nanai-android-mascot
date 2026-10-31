# %dms

- **規格**: [pct-dms.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-dms/) (ukadoc-spec/list/sakura-script/environment-variable/pct-dms.md)
- **検索語**: %dms
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:1` `//! SakuraScript Environment Variable Interpolation (%username, %selfname, %dms,`
- `crates/ui/src/script/env.rs:37` `result = result.replace("%dms", &now.timestamp_subsec_millis().to_string());`
- `crates/ui/src/script/env.rs:63` `let script = "%username, hello! Today is %year/%month/%day %hour:%minute:%second`

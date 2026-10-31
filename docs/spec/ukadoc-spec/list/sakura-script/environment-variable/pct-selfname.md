# %selfname

- **規格**: [pct-selfname.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-selfname/) (ukadoc-spec/list/sakura-script/environment-variable/pct-selfname.md)
- **検索語**: selfname
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:1` `//! SakuraScript Environment Variable Interpolation (%username, %selfname, %dms,`
- `crates/ui/src/script/env.rs:8` `selfname: &str,`
- `crates/ui/src/script/env.rs:14` `result = result.replace("%selfname", selfname);`
- `crates/ui/src/script/env.rs:16` `result = result.replace("%ms", selfname);`

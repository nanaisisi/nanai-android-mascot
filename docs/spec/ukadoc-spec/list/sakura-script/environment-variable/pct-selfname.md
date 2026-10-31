# %selfname

- **規格**: [pct-selfname.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-selfname/) (ukadoc-spec/list/sakura-script/environment-variable/pct-selfname.md)
- **検索語**: selfname
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「selfname」が見つからない。


## 実装箇所

- `crates/ui/src/script/env.rs:1` `//! SakuraScript Environment Variable Interpolation (%username, %selfname, %hour`
- `crates/ui/src/script/env.rs:8` `selfname: &str,`
- `crates/ui/src/script/env.rs:14` `result = result.replace("%selfname", selfname);`

# %mh

- **規格**: [pct-mh.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-mh/) (ukadoc-spec/list/sakura-script/environment-variable/pct-mh.md)
- **検索語**: %mh
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:1` `//! SakuraScript Environment Variable Interpolation (%username, %selfname, %dms,`
- `crates/ui/src/script/env.rs:34` `result = result.replace("%mh", "0");`

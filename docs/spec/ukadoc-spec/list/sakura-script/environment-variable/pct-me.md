# %me

- **規格**: [pct-me.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-me/) (ukadoc-spec/list/sakura-script/environment-variable/pct-me.md)
- **検索語**: %me
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:49` `result = result.replace("%me", "0");`

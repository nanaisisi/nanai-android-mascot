# %screenheight

- **規格**: [pct-screenheight.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-screenheight/) (ukadoc-spec/list/sakura-script/environment-variable/pct-screenheight.md)
- **検索語**: screenheight
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:43` `result = result.replace("%screenheight", "768");`

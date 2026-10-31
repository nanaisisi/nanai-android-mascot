# %mp

- **規格**: [pct-mp.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-mp/) (ukadoc-spec/list/sakura-script/environment-variable/pct-mp.md)
- **検索語**: %mp
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:47` `result = result.replace("%mp", "0");`

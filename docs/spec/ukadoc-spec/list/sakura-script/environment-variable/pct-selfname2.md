# %selfname2

- **規格**: [pct-selfname2.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-selfname2/) (ukadoc-spec/list/sakura-script/environment-variable/pct-selfname2.md)
- **検索語**: selfname2
- **対応状況**: ❌ 未実装

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:28` `result = result.replace("%selfname2", selfname);`

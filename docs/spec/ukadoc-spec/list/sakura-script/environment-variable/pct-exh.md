# %exh

- **規格**: [pct-exh.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-exh/) (ukadoc-spec/list/sakura-script/environment-variable/pct-exh.md)
- **検索語**: %exh
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:26` `result = result.replace("%exh", "0");`

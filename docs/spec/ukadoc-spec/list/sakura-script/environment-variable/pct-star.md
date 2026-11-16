# %\*

- **規格**: [pct-star.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-star/) (ukadoc-spec/list/sakura-script/environment-variable/pct-star.md)
- **検索語**: %\*
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理にて `%\*` (`%*`) の展開処理を実装 (`crates/nanai-core/src/sakura_script/env.rs` / `crates/ui/src/script/env.rs`)。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:125` `result = result.replace("%*", "");`
- `crates/ui/src/script/env.rs:94` `result = result.replace("%*", "");`

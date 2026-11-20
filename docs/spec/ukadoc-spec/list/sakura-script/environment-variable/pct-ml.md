# %ml

- **規格**: [pct-ml.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-ml/) (ukadoc-spec/list/sakura-script/environment-variable/pct-ml.md)
- **検索語**: %ml
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:249` `while result.contains("%ml") {`
- `ui/ts/ghost/command-handler/env.ts:241` `"%ml": options.words_ml?.length`
- `crates/nanai-core/src/sakura_script/env.rs:250` `result = result.replacen("%ml", &pick_word(&ctx.words_ml, "仲間"), 1);`
- `ui/ts/ghost/command-handler/env.ts:265` `result = result.replace(/%ml/g, () => pickCategoryWord("%ml", "仲間"));`
- `crates/nanai-core/src/sakura_script/env.rs:266` `result = result.replace("%ml", "0");`
- `crates/ui/src/script/env.rs:172` `while result.contains("%ml") {`

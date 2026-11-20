# %mz

- **規格**: [pct-mz.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-mz/) (ukadoc-spec/list/sakura-script/environment-variable/pct-mz.md)
- **検索語**: %mz
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:246` `while result.contains("%mz") {`
- `ui/ts/ghost/command-handler/env.ts:238` `"%mz": options.words_mz?.length`
- `crates/nanai-core/src/sakura_script/env.rs:247` `result = result.replacen("%mz", &pick_word(&ctx.words_mz, "パソコン"), 1);`
- `ui/ts/ghost/command-handler/env.ts:264` `result = result.replace(/%mz/g, () => pickCategoryWord("%mz", "パソコン"));`
- `crates/nanai-core/src/sakura_script/env.rs:267` `result = result.replace("%mz", "0");`
- `crates/ui/src/script/env.rs:165` `while result.contains("%mz") {`

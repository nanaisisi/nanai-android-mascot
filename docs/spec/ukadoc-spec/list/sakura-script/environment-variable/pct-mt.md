# %mt

- **規格**: [pct-mt.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-mt/) (ukadoc-spec/list/sakura-script/environment-variable/pct-mt.md)
- **検索語**: %mt
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:243` `while result.contains("%mt") {`
- `ui/ts/ghost/command-handler/env.ts:235` `"%mt": options.words_mt?.length`
- `crates/nanai-core/src/sakura_script/env.rs:244` `result = result.replacen("%mt", &pick_word(&ctx.words_mt, "ビンタ"), 1);`
- `ui/ts/ghost/command-handler/env.ts:263` `result = result.replace(/%mt/g, () => pickCategoryWord("%mt", "ビンタ"));`
- `crates/nanai-core/src/sakura_script/env.rs:264` `result = result.replace("%mt", "0");`
- `crates/ui/src/script/env.rs:158` `while result.contains("%mt") {`

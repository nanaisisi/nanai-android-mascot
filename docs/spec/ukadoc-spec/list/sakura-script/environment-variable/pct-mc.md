# %mc

- **規格**: [pct-mc.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-mc/) (ukadoc-spec/list/sakura-script/environment-variable/pct-mc.md)
- **検索語**: %mc
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:240` `while result.contains("%mc") {`
- `ui/ts/ghost/command-handler/env.ts:232` `"%mc": options.words_mc?.length`
- `crates/nanai-core/src/sakura_script/env.rs:241` `result = result.replacen("%mc", &pick_word(&ctx.words_mc, "ソニー"), 1);`
- `ui/ts/ghost/command-handler/env.ts:262` `result = result.replace(/%mc/g, () => pickCategoryWord("%mc", "ソニー"));`
- `crates/nanai-core/src/sakura_script/env.rs:265` `result = result.replace("%mc", "0");`
- `crates/ui/src/script/env.rs:151` `while result.contains("%mc") {`

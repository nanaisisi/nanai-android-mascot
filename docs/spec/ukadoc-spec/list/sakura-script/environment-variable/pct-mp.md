# %mp

- **規格**: [pct-mp.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-mp/) (ukadoc-spec/list/sakura-script/environment-variable/pct-mp.md)
- **検索語**: %mp
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:234` `while result.contains("%mp") {`
- `ui/ts/ghost/command-handler/env.ts:226` `"%mp": options.words_mp?.length`
- `crates/nanai-core/src/sakura_script/env.rs:235` `result = result.replacen("%mp", &pick_word(&ctx.words_mp, "秋葉原"), 1);`
- `ui/ts/ghost/command-handler/env.ts:260` `result = result.replace(/%mp/g, () => pickCategoryWord("%mp", "秋葉原"));`
- `crates/nanai-core/src/sakura_script/env.rs:261` `result = result.replace("%mp", "0");`
- `crates/ui/src/script/env.rs:137` `while result.contains("%mp") {`

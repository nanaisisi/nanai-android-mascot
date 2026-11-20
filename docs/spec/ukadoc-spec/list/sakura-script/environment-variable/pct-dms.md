# %dms

- **規格**: [pct-dms.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-dms/) (ukadoc-spec/list/sakura-script/environment-variable/pct-dms.md)
- **検索語**: %dms
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:223` `result = result.replace("%dms", "0");`
- `ui/ts/ghost/command-handler/env.ts:244` `"%dms": options.words_dms?.length`
- `crates/nanai-core/src/sakura_script/env.rs:252` `while result.contains("%dms") {`
- `ui/ts/ghost/command-handler/env.ts:266` `result = result.replace(/%dms/g, () =>`
- `crates/nanai-core/src/sakura_script/env.rs:254` `"%dms",`
- `ui/ts/ghost/command-handler/env.ts:267` `pickCategoryWord("%dms", "意外と近くにいた宇宙人"),`

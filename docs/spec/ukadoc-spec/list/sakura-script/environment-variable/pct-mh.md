# %mh

- **規格**: [pct-mh.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-mh/) (ukadoc-spec/list/sakura-script/environment-variable/pct-mh.md)
- **検索語**: %mh
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:237` `while result.contains("%mh") {`
- `ui/ts/ghost/command-handler/env.ts:229` `"%mh": options.words_mh?.length`
- `crates/nanai-core/src/sakura_script/env.rs:238` `result = result.replacen("%mh", &pick_word(&ctx.words_mh, "コンビニ"), 1);`
- `ui/ts/ghost/command-handler/env.ts:261` `result = result.replace(/%mh/g, () => pickCategoryWord("%mh", "コンビニ"));`
- `crates/nanai-core/src/sakura_script/env.rs:262` `result = result.replace("%mh", "0");`
- `crates/ui/src/script/env.rs:144` `while result.contains("%mh") {`

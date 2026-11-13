# %selfname

- **規格**: [pct-selfname.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-selfname/) (ukadoc-spec/list/sakura-script/environment-variable/pct-selfname.md)
- **検索語**: selfname
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:252` `pub selfname: String,`
- `ui/ts/ghost/sakura-command-handler.ts:96` `selfname: this.player?.app?.ghostController?.currentGhost?.name,`
- `tests/ghost-coverage-boost/command-handler.test.ts:72` `const expanded = handler.expandEnv("Hello %username, I am %selfname");`
- `crates/nanai-core/src/sakura_script.rs:266` `selfname: "Sakura".to_string(),`
- `ui/ts/ghost/command-handler/env.ts:109` `const selfname = options.selfname ?? "Nanai";`
- `tests/parser-fuzzing/cycle9-syntax-fuzzing.test.ts:88` `"\\%\\%\\%property[date.year]\\\\%username%selfname",`

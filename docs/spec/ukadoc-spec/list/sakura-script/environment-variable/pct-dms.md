# %dms

- **規格**: [pct-dms.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-dms/) (ukadoc-spec/list/sakura-script/environment-variable/pct-dms.md)
- **検索語**: %dms
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:41` `result = result.replace("%dms", "0");`
- `ui/ts/ghost/command-handler/env.ts:215` `"%dms": "0",`

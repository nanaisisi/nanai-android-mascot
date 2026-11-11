# %mc

- **規格**: [pct-mc.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-mc/) (ukadoc-spec/list/sakura-script/environment-variable/pct-mc.md)
- **検索語**: %mc
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:54` `result = result.replace("%mc", "0");`
- `ui/ts/ghost/command-handler/env.ts:226` `"%mc": "0",`

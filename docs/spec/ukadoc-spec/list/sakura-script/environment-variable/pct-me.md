# %me

- **規格**: [pct-me.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-me/) (ukadoc-spec/list/sakura-script/environment-variable/pct-me.md)
- **検索語**: %me
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:52` `result = result.replace("%me", "0");`
- `ui/ts/ghost/command-handler/env.ts:224` `"%me": "0",`

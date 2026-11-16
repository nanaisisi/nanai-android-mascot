# %day

- **規格**: [pct-day.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-day/) (ukadoc-spec/list/sakura-script/environment-variable/pct-day.md)
- **検索語**: %day
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理にて `%day` の置換処理を完全実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs` `result = result.replace("%day", ...)`
- `crates/ui/src/script/env.rs:37` `result = result.replace("%day", "30");`
- `ui/ts/ghost/command-handler/env.ts:211` `"%day": String(now.getDate()),`

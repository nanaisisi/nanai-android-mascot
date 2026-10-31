# %day

- **規格**: [pct-day.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-day/) (ukadoc-spec/list/sakura-script/environment-variable/pct-day.md)
- **検索語**: %day
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:34` `result = result.replace("%day", &now.day().to_string());`
- `crates/ui/src/script/env.rs:64` `let script = "%username, hello! Today is %year/%month/%day %hour:%minute:%second`

# %m?

- **規格**: [pct-m-q.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-m-q/) (ukadoc-spec/list/sakura-script/environment-variable/pct-m-q.md)
- **検索語**: %m?
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/ui/src/script/env.rs:57` `// %m? 単語-非限定環境変数クエリ [pct-m-q.md]`
- `crates/ui/src/script/env.rs:58` `result = result.replace("%m?", "");`
- `crates/ui/src/script/env.rs:73` `let script = "%username, hello! Property: %property[currentghost.name] %m? %*";`
- `crates/ui/src/script/env.rs:77` `assert!(!expanded.contains("%m?"));`
- `ui/js/ghost/command-handler/env.js:8` `* デフォルトのランダム単語リスト (%m? 用)`

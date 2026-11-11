# \v

- **規格**: [v.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/v/) (ukadoc-spec/list/sakura-script/event/v.md)
- **検索語**: \v
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「\v」が見つからない(短いトークンのため誤検出の可能性大)。

## 実装箇所

- `crates/ui/src/script/parser/executor.rs:116` `Some('v') => callback(SakuraCommand::Voice("".into())), // \v`
- `crates/ui/src/script/parser/tests.rs:117` `let script = "\\\\\\C\\a\\v\\+\\k[ignored]\\2\\3\\4\\5\\6\\7\\8\\9\\c[arg_clear]`

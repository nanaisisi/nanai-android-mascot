# \v

- **規格**: [v.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/v/) (ukadoc-spec/list/sakura-script/event/v.md)
- **検索語**: \v
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「\v」が見つからない(短いトークンのため誤検出の可能性大)。

## 実装箇所

- `crates/ui/src/script/parser/mod.rs:104` `Some('v') => callback(SakuraCommand::Voice("".into())), // \v`

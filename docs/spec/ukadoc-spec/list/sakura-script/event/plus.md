# \+

- **規格**: [plus.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/plus/) (ukadoc-spec/list/sakura-script/event/plus.md)
- **検索語**: \+
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「\+」が見つからない(短いトークンのため誤検出の可能性大)。

## 実装箇所

- `crates/ui/src/script/command.rs:39` `Plus,      // \+ / \_+`
- `crates/ui/src/script/parser/mod.rs:105` `Some('+') => callback(SakuraCommand::Plus),  // \+`

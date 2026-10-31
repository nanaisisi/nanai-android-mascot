# \+

- **規格**: [plus.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/plus/) (ukadoc-spec/list/sakura-script/event/plus.md)
- **検索語**: Plus
- **対応状況**: ✅ 実装済

## 突合結果

`\+` (Plus) コマンドのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:40` `Plus,      // \+ / \_+`
- `crates/ui/src/script/parser/mod.rs:111` `Some('+') => callback(SakuraCommand::Plus),  // \+`
- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:159` `callback(SakuraCommand::Plus);`

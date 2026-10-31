# \_+

- **規格**: [_-plus.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/_-plus/) (ukadoc-spec/list/sakura-script/event/_-plus.md)
- **検索語**: Plus
- **対応状況**: ✅ 実装済

## 突合結果

`\_+` (Plus) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:39` `Plus,      // \+ / \_+`
- `crates/ui/src/script/parser/mod.rs:105` `Some('+') => callback(SakuraCommand::Plus),  // \+`
- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:129` `callback(SakuraCommand::Plus);`

# \j[ID]

- **規格**: [j-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/j-ID/) (ukadoc-spec/list/sakura-script/open/j-ID.md)
- **検索語**: Jump
- **対応状況**: ✅ 実装済

## 突合結果

`\j[ID]` (スクリプト/URLジャンプ) コマンドのパース処理を実装 (`crates/ui/src/script/parser/mod.rs` -> `SakuraCommand::Jump`)。

## 実装箇所

- `crates/ui/src/script/command.rs:39` `Jump(String), // \j[ID] / \j[URL] ジャンプ`
- `crates/ui/src/script/parser/mod.rs:108` `callback(SakuraCommand::Jump(target));`

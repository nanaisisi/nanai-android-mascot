# \__t

- **規格**: [__t.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/__t/) (ukadoc-spec/list/sakura-script/open/__t.md)
- **検索語**: \__t
- **対応状況**: ✅ 実装済

## 突合結果

`\__t` (ティーチボックス展開) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs` -> `SakuraCommand::OpenDialog`)。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:124` `// \__v, \__q, \__c, \__t, \_+`
- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:135` `// \__t open teachbox`

# \__c

- **規格**: [__c.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/__c/) (ukadoc-spec/list/sakura-script/open/__c.md)
- **検索語**: \__c
- **対応状況**: ✅ 実装済

## 突合結果

`\__c` (コミュニケートボックス展開) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs` -> `SakuraCommand::OpenDialog`)。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:124` `// \__v, \__q, \__c, \__t, \_+`
- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:127` `// \__c open communicatebox`

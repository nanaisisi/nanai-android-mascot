# \__c

- **規格**: [__c.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/__c/) (ukadoc-spec/list/sakura-script/open/__c.md)
- **検索語**: \__c
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\__c` (コミュニケートボックス展開) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs` -> `SakuraCommand::OpenDialog`)。

## 実装箇所

- `crates/ui/src/script/parser/tests.rs:89` `\\__c\`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:1` `//! アンダースコア接頭辞（\\_w, \\_q, \\_?, \\_a, \\_s, \\_m, \\_u, \\_l, \\__c, \\__q 等）コマ`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:150` `// \__v, \__q, \__c, \__t, \_+`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:153` `// \__c open communicatebox`

# \__t

- **規格**: [__t.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/__t/) (ukadoc-spec/list/sakura-script/open/__t.md)
- **検索語**: \__t
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\__t` (ティーチボックス展開) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs` -> `SakuraCommand::OpenDialog`)。

## 実装箇所

- `crates/ui/src/script/parser/tests.rs:90` `\\__t\`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:150` `// \__v, \__q, \__c, \__t, \_+`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:161` `// \__t open teachbox`

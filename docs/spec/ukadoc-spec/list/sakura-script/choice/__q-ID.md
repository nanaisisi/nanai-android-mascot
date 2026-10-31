# \__q[ID,...]

- **規格**: [__q-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/__q-ID/) (ukadoc-spec/list/sakura-script/choice/__q-ID.md)
- **検索語**: \__q
- **対応状況**: ✅ 実装済

## 突合結果

`\_\_q` (Quick) タグのパーサ処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:124` `// \__v, \__q, \__c, \__t, \_+`
- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:147` `// \__q[ID] quick choice mode`

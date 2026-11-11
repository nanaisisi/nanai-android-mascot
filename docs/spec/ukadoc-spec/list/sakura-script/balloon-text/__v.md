# \__v[オプション]

- **規格**: [__v.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/__v/)
- **検索語**: \__v
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\__v[...]` (Voice) タグのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。


## 実装箇所

- `crates/ui/src/script/command.rs:65` `Voice(String), // \__v[opt]`
- `crates/ui/src/script/parser/tests.rs:91` `\\__v[voice_opt]\`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:150` `// \__v, \__q, \__c, \__t, \_+`

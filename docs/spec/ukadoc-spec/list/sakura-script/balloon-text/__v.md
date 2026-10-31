# \__v[オプション]

- **規格**: [__v.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/__v/)
- **検索語**: \__v
- **対応状況**: ✅ 実装済

## 突合結果

`\__v[...]` (Voice) タグのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。


## 実装箇所

- `crates/ui/src/script/command.rs:51` `Voice(String),     // \__v[opt]`
- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:104` `// \__v, \__q, \_+`
- `ui/js/ghost/sakura-tokenizer.js:311` `// \_x や \__v のようなアンダースコアで始まるタグ名（[ 直前まで）をスキップ`

# \c

- **規格**: [c.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/c/) (ukadoc-spec/list/sakura-script/balloon-text/c.md)
- **検索語**: \c
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js で処理: バルーンクリア。


## 実装箇所

- `crates/ui/src/script/command.rs:15` `Clear,        // \c`
- `ui/js/ghost/sakura-tokenizer.js:131` `// \c (クリア)`

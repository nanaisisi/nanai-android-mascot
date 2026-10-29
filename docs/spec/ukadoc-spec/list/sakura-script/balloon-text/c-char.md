# \c[char,数値]

- **規格**: [c-char.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/c-char/) (ukadoc-spec/list/sakura-script/balloon-text/c-char.md)
- **検索語**: \c
- **対応状況**: ❌ 未実装 (パーサは引数形式を解釈しない)

## 突合結果

パーサは基本形のみ処理し、この引数形式は解釈しない。


## 実装箇所

- `crates/ui/src/script/command.rs:15` `Clear,        // \c`
- `ui/js/ghost/sakura-tokenizer.js:131` `// \c (クリア)`

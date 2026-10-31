# \c[line,数値]

- **規格**: [c-line.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/c-line/) (ukadoc-spec/list/sakura-script/balloon-text/c-line.md)
- **検索語**: \c
- **対応状況**: ✅ 実装済

## 突合結果

`\c[line,N]` 行クリアタグのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。


## 実装箇所

- `crates/ui/src/script/command.rs:24` `Clear,        // \c`
- `crates/ui/src/script/command.rs:25` `ClearArg { arg: String }, // \c[char,n], \c[line,n]`
- `crates/ui/src/script/parser/mod.rs:147` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
- `ui/js/ghost/sakura-tokenizer.js:131` `// \c (クリア)`

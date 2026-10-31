# \c

- **規格**: [c.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/c/) (ukadoc-spec/list/sakura-script/balloon-text/c.md)
- **検索語**: \c
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js で処理: バルーンクリア。

## 実装箇所

- `crates/ui/src/script/command.rs:24` `Clear,        // \c`
- `crates/ui/src/script/command.rs:25` `ClearArg { arg: String }, // \c[char,n], \c[line,n]`
- `crates/ui/src/script/parser/mod.rs:130` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
- `ui/js/ghost/sakura-tokenizer.js:131` `// \c (クリア)`
- `tests/sakura-tokenizer.test.js:10` `"\\0\\hHello\\1\\uWorld\\p[2]\\p0\\s[10]\\s0\\i[1,wait]\\i2\\w5\\_w[200]\\n\\n[h`

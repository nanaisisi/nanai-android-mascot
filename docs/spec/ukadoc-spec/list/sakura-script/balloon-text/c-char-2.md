# \c[char,数値,開始位置]

- **規格**: [c-char-2.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/c-char-2/) (ukadoc-spec/list/sakura-script/balloon-text/c-char-2.md)
- **検索語**: \c
- **対応状況**: ❌ 未実装 (パーサは引数形式を解釈しない)

## 突合結果

パーサは基本形のみ処理し、この引数形式は解釈しない。

## 実装箇所

- `crates/ui/src/script/command.rs:15` `Clear,        // \c`
- `crates/ui/src/script/parser/mod.rs:115` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
- `ui/js/ghost/sakura-tokenizer.js:131` `// \c (クリア)`
- `tests/sakura-tokenizer.test.js:10` `"\\0\\hHello\\1\\uWorld\\p[2]\\p0\\s[10]\\s0\\i[1,wait]\\i2\\w5\\_w[200]\\n\\n[h`

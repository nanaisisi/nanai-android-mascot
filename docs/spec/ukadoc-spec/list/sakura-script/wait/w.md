# \w時間

- **規格**: [w.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/w/) (ukadoc-spec/list/sakura-script/wait/w.md)
- **検索語**: \w
- **対応状況**: ✅ 実装済

## 突合結果

sakura-parser.js が \w1〜\w9 (1=50ms) として処理している。

## 実装箇所

- `crates/ui/src/lib.rs:60` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/script/command.rs:9` `Wait(u32),    // \w1..9, \_w[ms] (ミリ秒単位)`
- `crates/ui/src/script/parser/mod.rs:42` `// \w1..\w9`
- `crates/ui/src/script/parser/mod.rs:108` `let script = "\\0\\s[0]Hello\\w1\\e";`
- `crates/ui/src/script/parser/mod.rs:115` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`

# \i[ID,wait]

- **規格**: [i-ID-wait.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/i-ID-wait/) (ukadoc-spec/list/sakura-script/surface/i-ID-wait.md)
- **検索語**: \i
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: アニメーション呼出。

## 実装箇所

- `crates/ui/src/lib.rs:189` `let script = r"\0\1は鳴き声\i[3,wait]\i7この間は本文";`
- `crates/ui/src/script/command.rs:61` `}, // \i[ID], \i[ID,wait]`
- `crates/ui/src/script/parser/mod.rs:80` `// \i[ID] / \i[ID,wait] / \i0..\i9`
- `crates/ui/src/script/parser/mod.rs:153` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
- `ui/js/ghost/sakura-tokenizer.js:74` `// \i (アニメーション呼出: \i[ID], \i[ID,wait], \i1〜\i9)`

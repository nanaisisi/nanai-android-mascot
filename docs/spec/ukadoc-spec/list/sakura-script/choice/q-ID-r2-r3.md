# \q\[タイトル,ID,r*2*,r*3*...\]

- **規格**: [q-ID-r2-r3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID-r2-r3/) (ukadoc-spec/list/sakura-script/choice/q-ID-r2-r3.md)
- **検索語**: \q
- **対応状況**: ❌ 未実装

## 突合結果

パーサがタグを読み飛ばす、または sakura-command-handler.js が「未対応の \! コマンド」として扱い、該当処理はない。

## 実装箇所

- `src-tauri/src/shiori/headline.rs:115` `script.push_str(&format!("\\q[{},{}]\n", item.title, item.url));`
- `crates/ui/src/lib.rs:60` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/script/command.rs:29` `}, // \q[label,id]`
- `crates/ui/src/script/parser/mod.rs:91` `// \q[テキスト,ID] / \q[temp,テキスト,ID]`
- `crates/ui/src/script/parser/mod.rs:122` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`

# \q[タイトル,ID]

- **規格**: [q-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID/) (ukadoc-spec/list/sakura-script/choice/q-ID.md)
- **検索語**: \q
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: 選択肢 \q[テキスト,ID]。


## 実装箇所

- `src-tauri/src/shiori/headline.rs:113` `script.push_str(&format!("\\q[{},{}]\n", item.title, item.url));`
- `crates/ui/src/lib.rs:57` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/script/command.rs:19` `}, // \q[label,id]`
- `crates/ui/src/script/parser/mod.rs:84` `// \q[テキスト,ID] / \q[temp,テキスト,ID]`
- `crates/ui/src/script/parser/mod.rs:115` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`

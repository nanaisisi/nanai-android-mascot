# \q[タイトル,ID]

- **規格**: [q-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID/) (ukadoc-spec/list/sakura-script/choice/q-ID.md)
- **検索語**: \q
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: 選択肢 \q[テキスト,ID]。

## 実装箇所

- `src-tauri/src/shiori/headline.rs:115` `script.push_str(&format!("\\q[{},{}]\n", item.title, item.url));`
- `crates/ui/src/script/command.rs:37` `}, // \q[label,id,r2,...]`
- `crates/ui/src/script/ast/types/node.rs:24` `/// 選択肢（\\q[label,id,...]）ノード`
- `crates/ui/src/script/parser/executor.rs:108` `// \q[テキスト,ID] / \q[temp,テキスト,ID]`
- `crates/ui/src/script/parser/tests.rs:16` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`

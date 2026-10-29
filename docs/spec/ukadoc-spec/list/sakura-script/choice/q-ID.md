# \q[タイトル,ID]

- **規格**: [q-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID/) (ukadoc-spec/list/sakura-script/choice/q-ID.md)
- **検索語**: \q
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: 選択肢 \q[テキスト,ID]。


## 実装箇所

- `crates/ui/src/lib.rs:58` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/script/command.rs:19` `}, // \q[label,id]`
- `crates/ui/src/script/parser/brackets.rs:153` `/// `\q[テキスト,ID]` / `\q[temp,テキスト,ID]`（旧形式）`
- `crates/ui/src/script/parser/mod.rs:83` `// \q[テキスト,ID] / \q[temp,テキスト,ID]`
- `ui/js/ghost/sakura-tokenizer.js:199` `// \q[テキスト,ID] (選択肢)`

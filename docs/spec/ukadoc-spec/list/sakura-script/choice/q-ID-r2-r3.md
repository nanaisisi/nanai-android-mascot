# \q\[タイトル,ID,r*2*,r*3*...\]

- **規格**: [q-ID-r2-r3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID-r2-r3/) (ukadoc-spec/list/sakura-script/choice/q-ID-r2-r3.md)
- **検索語**: \q
- **対応状況**: ❌ 未実装

## 突合結果

パーサがタグを読み飛ばす、または sakura-command-handler.js が「未対応の \! コマンド」として扱い、該当処理はない。


## 実装箇所

- `crates/ui/src/lib.rs:58` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/script/command.rs:19` `}, // \q[label,id]`
- `crates/ui/src/script/parser/brackets.rs:153` `/// `\q[テキスト,ID]`/`\q[temp,テキスト,ID]`（旧形式）`
- `crates/ui/src/script/parser/mod.rs:83` `// \q[テキスト,ID] / \q[temp,テキスト,ID]`
- `ui/js/ghost/sakura-tokenizer.js:199` `// \q[テキスト,ID] (選択肢)`

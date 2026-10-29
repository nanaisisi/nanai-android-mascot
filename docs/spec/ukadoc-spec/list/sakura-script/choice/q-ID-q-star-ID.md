# \q[ID][タイトル]または\q*[ID][タイトル]

- **規格**: [q-ID-q-star-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID-q-star-ID/) (ukadoc-spec/list/sakura-script/choice/q-ID-q-star-ID.md)
- **検索語**: \q
- **対応状況**: ⚠️ 一部対応

## 突合結果

基本形 (ID/テキスト) のみ処理し、この拡張形式 (複数ID / OnID / script: / 追加参照) は未対応。


## 実装箇所

- `crates/ui/src/lib.rs:58` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/script/command.rs:19` `}, // \q[label,id]`
- `crates/ui/src/script/parser/brackets.rs:153` `/// `\q[テキスト,ID]`/`\q[temp,テキスト,ID]`（旧形式）`
- `crates/ui/src/script/parser/mod.rs:83` `// \q[テキスト,ID] / \q[temp,テキスト,ID]`
- `ui/js/ghost/sakura-tokenizer.js:199` `// \q[テキスト,ID] (選択肢)`

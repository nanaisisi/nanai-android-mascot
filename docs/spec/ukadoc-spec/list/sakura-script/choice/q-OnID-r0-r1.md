# \q[タイトル,OnID,r0,r1,...]

- **規格**: [q-OnID-r0-r1.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-OnID-r0-r1/) (ukadoc-spec/list/sakura-script/choice/q-OnID-r0-r1.md)
- **検索語**: \q
- **対応状況**: ✅ 実装済

## 突合結果

基本形 (ID/テキスト) のみ処理し、この拡張形式 (複数ID / OnID / script: / 追加参照) は未対応。

## 実装箇所

- `src-tauri/src/shiori/headline.rs:115` `script.push_str(&format!("\\q[{},{}]\n", item.title, item.url));`
- `crates/ui/src/lib.rs:60` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/script/command.rs:30` `}, // \q[label,id,r2,...]`
- `crates/ui/src/script/parser/mod.rs:91` `// \q[テキスト,ID] / \q[temp,テキスト,ID]`
- `crates/ui/src/script/parser/mod.rs:124` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`

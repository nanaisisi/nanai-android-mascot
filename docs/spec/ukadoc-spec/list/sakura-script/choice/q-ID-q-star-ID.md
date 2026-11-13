# \q[ID][タイトル]または\q*[ID][タイトル]

- **規格**: [q-ID-q-star-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID-q-star-ID/) (ukadoc-spec/list/sakura-script/choice/q-ID-q-star-ID.md)
- **検索語**: \q
- **対応状況**: ✅ 実装済

## 突合結果

拡張形式 (複数ID / OnID / script: / 追加参照) を含む選択肢タグのパースおよび SakuraCommand::Choice { label, id, args } へのマッピングを実装 (crates/ui/src/script/parser/brackets/handlers/basic.rs)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:24` `/// 選択肢 (\q[title,id])`
- `src-tauri/src/shiori/headline.rs:115` `script.push_str(&format!("\\q[{},{}]\n", item.title, item.url));`
- `ui/ts/ghost/balloon-window/interactive.ts:8` `* 選択肢ボタン (\q) およびアンカーリンク (\_a) のクリックイベントを設定`
- `tests/sakura-ast.test.ts:89` `"\\0\\s[0]Hello \\_a[anchor1,r1]Documentation\\_a\\q[Click Here,choice1]\\1\\s[1`
- `crates/nanai-core/src/sakura_script.rs:27` `/// 選択肢 (\q[title,id])`
- `ui/ts/ghost/balloon-window/interactive.ts:18` `// 選択肢ボタン (\q)`

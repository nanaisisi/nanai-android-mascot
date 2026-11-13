# \q\[タイトル,ID,r*2*,r*3*...\]

- **規格**: [q-ID-r2-r3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID-r2-r3/) (ukadoc-spec/list/sakura-script/choice/q-ID-r2-r3.md)
- **検索語**: \q
- **対応状況**: ✅ 実装済

## 突合結果

実コードベースにて当該タグ/コマンドのパース処理およびコマンドモデルへのマッピングを実装・対応済。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:24` `/// 選択肢 (\q[title,id])`
- `src-tauri/src/shiori/headline.rs:115` `script.push_str(&format!("\\q[{},{}]\n", item.title, item.url));`
- `ui/ts/ghost/balloon-window/interactive.ts:8` `* 選択肢ボタン (\q) およびアンカーリンク (\_a) のクリックイベントを設定`
- `tests/sakura-ast.test.ts:89` `"\\0\\s[0]Hello \\_a[anchor1,r1]Documentation\\_a\\q[Click Here,choice1]\\1\\s[1`
- `crates/nanai-core/src/sakura_script.rs:27` `/// 選択肢 (\q[title,id])`
- `ui/ts/ghost/balloon-window/interactive.ts:18` `// 選択肢ボタン (\q)`

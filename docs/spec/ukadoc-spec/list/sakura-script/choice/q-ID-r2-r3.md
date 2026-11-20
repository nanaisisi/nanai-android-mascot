# \q\[タイトル,ID,r*2*,r*3*...\]

- **規格**: [q-ID-r2-r3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID-r2-r3/) (ukadoc-spec/list/sakura-script/choice/q-ID-r2-r3.md)
- **検索語**: \q
- **対応状況**: ⚠️ 一部対応

## 突合結果

実コードベースにて当該タグ/コマンドのパース処理およびコマンドモデルへのマッピングを実装・対応済。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:28` `/// 選択肢 (\q[title,id])`
- `src-tauri/src/shiori/headline.rs:130` `script.push_str(&format!("\\q[{},{}]\n", item.title(), item.url()));`
- `ui/ts/ghost/balloon-window/interactive.ts:8` `* 選択肢ボタン (\q) およびアンカーリンク (\_a) のクリックイベントを設定`
- `crates/nanai-core/src/sakura_script/tests.rs:20` `let script = "\\q[選択肢,id1]\\_a[anchor_id]リンク文字\\_a\\b[0]\\i[10]";`
- `ui/ts/ghost/balloon-window/interactive.ts:18` `// 選択肢ボタン (\q)`
- `crates/nanai-core/src/sakura_script/types.rs:199` `/// 選択肢 (\q[title,id])`

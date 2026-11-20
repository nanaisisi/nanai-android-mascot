# \q[タイトル,ID1,ID2,ID3...]

- **規格**: [q-ID1-ID2-ID3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/q-ID1-ID2-ID3/) (ukadoc-spec/list/sakura-script/choice/q-ID1-ID2-ID3.md)
- **検索語**: \q
- **対応状況**: ⚠️ 一部対応

## 突合結果

拡張形式 (複数ID / OnID / script: / 追加参照) を含む選択肢タグのパースおよび SakuraCommand::Choice { label, id, args } へのマッピングを実装 (crates/ui/src/script/parser/brackets/handlers/basic.rs)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:28` `/// 選択肢 (\q[title,id])`
- `src-tauri/src/shiori/headline.rs:130` `script.push_str(&format!("\\q[{},{}]\n", item.title(), item.url()));`
- `ui/ts/ghost/balloon-window/interactive.ts:8` `* 選択肢ボタン (\q) およびアンカーリンク (\_a) のクリックイベントを設定`
- `crates/nanai-core/src/sakura_script/tests.rs:20` `let script = "\\q[選択肢,id1]\\_a[anchor_id]リンク文字\\_a\\b[0]\\i[10]";`
- `ui/ts/ghost/balloon-window/interactive.ts:18` `// 選択肢ボタン (\q)`
- `crates/nanai-core/src/sakura_script/types.rs:199` `/// 選択肢 (\q[title,id])`

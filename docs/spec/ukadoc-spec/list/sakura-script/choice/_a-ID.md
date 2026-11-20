# \_a[ID]

- **規格**: [_a-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/_a-ID/) (ukadoc-spec/list/sakura-script/choice/_a-ID.md)
- **検索語**: \_a
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: アンカー (begin/end)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:34` `/// アンカー (\_a[id]title\_a)`
- `ui/ts/ghost/balloon-window/interactive.ts:8` `* 選択肢ボタン (\q) およびアンカーリンク (\_a) のクリックイベントを設定`
- `ui/css/mascot.css:417` `/* バルーン内のアンカーリンク (\_a) */`
- `crates/nanai-core/src/sakura_script/tests.rs:20` `let script = "\\q[選択肢,id1]\\_a[anchor_id]リンク文字\\_a\\b[0]\\i[10]";`
- `ui/ts/ghost/balloon-window/interactive.ts:32` `// アンカーリンク (\_a)`
- `crates/nanai-core/src/sakura_script/types.rs:205` `/// アンカー (\_a[id]title\_a)`

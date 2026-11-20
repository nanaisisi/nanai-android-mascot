# \_a[OnID,r0,r1...]

- **規格**: [_a-OnID-r0-r1.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/_a-OnID-r0-r1/) (ukadoc-spec/list/sakura-script/choice/_a-OnID-r0-r1.md)
- **検索語**: \_a
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_a[OnID,r0,r1...]` 形式のアンカータグのパース処理および `SakuraCommand::Anchor` へのマッピングを実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:34` `/// アンカー (\_a[id]title\_a)`
- `ui/ts/ghost/balloon-window/interactive.ts:8` `* 選択肢ボタン (\q) およびアンカーリンク (\_a) のクリックイベントを設定`
- `ui/css/mascot.css:417` `/* バルーン内のアンカーリンク (\_a) */`
- `crates/nanai-core/src/sakura_script/tests.rs:20` `let script = "\\q[選択肢,id1]\\_a[anchor_id]リンク文字\\_a\\b[0]\\i[10]";`
- `ui/ts/ghost/balloon-window/interactive.ts:32` `// アンカーリンク (\_a)`
- `crates/nanai-core/src/sakura_script/types.rs:205` `/// アンカー (\_a[id]title\_a)`

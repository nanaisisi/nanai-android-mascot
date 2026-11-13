# \_a[ID,r2,r3...]

- **規格**: [_a-ID-r2-r3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/_a-ID-r2-r3/) (ukadoc-spec/list/sakura-script/choice/_a-ID-r2-r3.md)
- **検索語**: \_a
- **対応状況**: ✅ 実装済

## 突合結果

`\_a[ID,r2,r3...]` 形式の拡張アンカータグのパース処理および `SakuraCommand::Anchor { id, text, args }` へのマッピングを実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:30` `/// アンカー (\_a[id]title\_a)`
- `ui/ts/ghost/balloon-window/interactive.ts:8` `* 選択肢ボタン (\q) およびアンカーリンク (\_a) のクリックイベントを設定`
- `ui/css/mascot.css:329` `/* バルーン内のアンカーリンク (\_a) */`
- `tests/sakura-ast.test.ts:20` `const script = "\\0\\s[0]Hello!\\_a[id1,arg1]Link\\_a\\1\\s[10]Kero!\\e";`
- `crates/nanai-core/src/sakura_script.rs:29` `/// アンカー (\_a[id]title\_a)`
- `ui/ts/ghost/balloon-window/interactive.ts:32` `// アンカーリンク (\_a)`

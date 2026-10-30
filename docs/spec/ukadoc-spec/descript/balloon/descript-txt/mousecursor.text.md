# mousecursor.text,ファイル名

- **規格**: [mousecursor.text.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/mousecursor.text.md)
- **検索語**: mousecursor.text
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` にて `--balloon-cursor-text` カスタムプロパティおよび CSS `cursor` スタイリングとして完全実装済。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:208` `// [cursor,ファイル名 / mousecursor,ファイル名], [mousecursor.arrow,ファイル名], [mousecursor.g`
- `src-tauri/src/ghost/scan/directory.rs:213` `let _mc_text = m.get("mousecursor.text");`
- `ui/js/core/actions/balloon-descript/assets.js:64` `// [mousecursor.text,ファイル名]:`
- `ui/js/core/actions/balloon-descript/assets.js:65` `setMouseCursor("mousecursor.text", "--balloon-cursor-text");`

# mousecursor.wait,ファイル名

- **規格**: [mousecursor.wait.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/mousecursor.wait.md)
- **検索語**: mousecursor.wait
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` にて `--balloon-cursor-wait` カスタムプロパティおよび CSS `cursor` スタイリングとして完全実装済。


## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:208` `// [cursor,ファイル名 / mousecursor,ファイル名], [mousecursor.arrow,ファイル名], [mousecursor.g`
- `src-tauri/src/ghost/scan/directory.rs:214` `let _mc_wait = m.get("mousecursor.wait");`
- `ui/js/core/actions/balloon-descript/assets.js:66` `// [mousecursor.wait,ファイル名]:`
- `ui/js/core/actions/balloon-descript/assets.js:67` `setMouseCursor("mousecursor.wait", "--balloon-cursor-wait");`

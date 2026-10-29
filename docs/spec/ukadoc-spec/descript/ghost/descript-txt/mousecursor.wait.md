# mousecursor.wait,ファイル名

- **規格**: [mousecursor.wait.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.wait/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.wait.md)
- **検索語**: mousecursor.wait
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `mousecursor.wait` を検出し、`--balloon-cursor-wait` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [cursor,ファイル名 / mousecursor,ファイル名], [mousecursor.arrow...`
- `ui/js/core/actions/balloon-descript/assets.js` `setMouseCursor("mousecursor.wait", "--balloon-cursor-wait");`

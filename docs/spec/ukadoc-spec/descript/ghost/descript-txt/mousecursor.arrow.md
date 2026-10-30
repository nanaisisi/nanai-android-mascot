# mousecursor.arrow,ファイル名

- **規格**: [mousecursor.arrow.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.arrow/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.arrow.md)
- **検索語**: mousecursor.arrow
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `mousecursor.arrow` を検出し、`--balloon-cursor-arrow` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:196` `// [cursor,ファイル名 / mousecursor,ファイル名], [mousecursor.arrow,ファイル名], [mousecursor.g`
- `src-tauri/src/ghost/scan/directory.rs:198` `let _mc_arrow = m.get("mousecursor.arrow");`
- `ui/js/core/actions/balloon-descript/assets.js:56` `// [mousecursor.arrow,ファイル名]:`
- `ui/js/core/actions/balloon-descript/assets.js:57` `setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");`
- `tests/balloon-descript.test.js:125` `"mousecursor.arrow": "cursor.cur",`

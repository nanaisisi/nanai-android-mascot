# mousecursor.arrow,ファイル名

- **規格**: [mousecursor.arrow.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.arrow/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.arrow.md)
- **検索語**: mousecursor.arrow
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `mousecursor.arrow` を検出し、`--balloon-cursor-arrow` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:62` `// [mousecursor.arrow,ファイル名]:`
- `ui/js/core/actions/balloon-descript/assets.js:63` `setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");`

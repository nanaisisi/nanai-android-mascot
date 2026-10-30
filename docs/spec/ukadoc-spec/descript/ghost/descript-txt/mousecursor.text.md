# mousecursor.text,ファイル名

- **規格**: [mousecursor.text.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.text/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.text.md)
- **検索語**: mousecursor.text
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `mousecursor.text` を検出し、`--balloon-cursor-text` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:208` `// [cursor,ファイル名 / mousecursor,ファイル名], [mousecursor.arrow,ファイル名], [mousecursor.g`
- `src-tauri/src/ghost/scan/directory.rs:213` `let _mc_text = m.get("mousecursor.text");`
- `ui/js/core/actions/balloon-descript/assets.js:64` `// [mousecursor.text,ファイル名]:`
- `ui/js/core/actions/balloon-descript/assets.js:65` `setMouseCursor("mousecursor.text", "--balloon-cursor-text");`

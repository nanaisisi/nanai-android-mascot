# cursor,ファイル名 / mousecursor,ファイル名

- **規格**: [cursor.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/cursor/) (ukadoc-spec/descript/ghost/descript-txt/cursor.md)
- **検索語**: cursor, mousecursor
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `cursor` を検出し、`--balloon-cursor-default` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [cursor,ファイル名 / mousecursor,ファイル名]...`
- `ui/js/core/actions/balloon-descript/assets.js` `setMouseCursor("cursor", "--balloon-cursor-default");`

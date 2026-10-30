# mousecursor.hand,ファイル名

- **規格**: [mousecursor.hand.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.hand/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.hand.md)
- **検索語**: mousecursor.hand
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `mousecursor.hand` をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:197` `// [cursor,ファイル名 / mousecursor,ファイル名], [mousecursor.arrow,ファイル名], [mousecursor.g`
- `src-tauri/src/ghost/scan/directory.rs:201` `let _mc_hand = m.get("mousecursor.hand");`

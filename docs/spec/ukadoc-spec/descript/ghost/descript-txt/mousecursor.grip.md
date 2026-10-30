# mousecursor.grip,ファイル名

- **規格**: [mousecursor.grip.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.grip/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.grip.md)
- **検索語**: mousecursor.grip
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `mousecursor.grip` をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:197` `// [cursor,ファイル名 / mousecursor,ファイル名], [mousecursor.arrow,ファイル名], [mousecursor.g`
- `src-tauri/src/ghost/scan/directory.rs:200` `let _mc_grip = m.get("mousecursor.grip");`

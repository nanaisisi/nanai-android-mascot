# cursor,ファイル名 / mousecursor,ファイル名

- **規格**: [cursor.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/cursor/) (ukadoc-spec/descript/ghost/descript-txt/cursor.md)
- **検索語**: cursor, mousecursor
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `cursor` を検出し、`--balloon-cursor-default` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:154` `let mut cursor = std::io::Cursor::new(content);`
- `src-tauri/src/commands/install/utils.rs:155` `let map = parse_zip_entry_descript(&mut cursor);`
- `src-tauri/src/commands/install/utils.rs:166` `let mut cursor = std::io::Cursor::new(empty);`
- `src-tauri/src/commands/install/utils.rs:167` `let map = parse_zip_entry_descript(&mut cursor);`
- `src-tauri/src/shiori/dynamic/host.rs:207` `let mut cursor = Cursor::new(data);`

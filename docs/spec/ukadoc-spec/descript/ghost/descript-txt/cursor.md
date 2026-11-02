# cursor,ファイル名 / mousecursor,ファイル名

- **規格**: [cursor.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/cursor/) (ukadoc-spec/descript/ghost/descript-txt/cursor.md)
- **検索語**: cursor, mousecursor
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `cursor` を検出し、`--balloon-cursor-default` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:154` `let mut cursor = std::io::Cursor::new(content);`
- `src-tauri/src/commands/install/utils.rs:155` `let map = parse_zip_entry_descript(&mut cursor);`
- `src-tauri/shiori-host/src/main.rs:227` `let mut cursor_in = std::io::Cursor::new(input);`
- `src-tauri/shiori-host/src/main.rs:230` `load_and_run(dll_path.to_str().unwrap(), &mut cursor_in, &mut out_ok),`
- `ui/css/character.css:27` `cursor: grab;`
- `ui/js/core/actions/balloon-descript/assets.js:78` `// [cursor, mousecursor]:`

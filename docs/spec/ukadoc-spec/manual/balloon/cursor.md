# 選択肢カーソル設定 (`cursor.*`)

- **対応状況**: ✅ 実装済

`cursor`, `cursor.notselect` などの選択肢ハイライト背景・テキストカラーおよびスタイル適用。


## 実装箇所

- `src-tauri/shiori-host/src/main.rs:227` `let mut cursor_in = std::io::Cursor::new(input);`
- `src-tauri/shiori-host/src/main.rs:230` `load_and_run(dll_path.to_str().unwrap(), &mut cursor_in, &mut out_ok),`
- `src-tauri/src/commands/install/utils.rs:154` `let mut cursor = std::io::Cursor::new(content);`
- `src-tauri/src/commands/install/utils.rs:155` `let map = parse_zip_entry_descript(&mut cursor);`
- `ui/css/balloon-window.css:42` `cursor: grab;`

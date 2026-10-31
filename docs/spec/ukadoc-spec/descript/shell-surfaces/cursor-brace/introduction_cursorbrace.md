# cursorブレス記述例

- **規格**: [introduction_cursorbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace.md)
- **検索語**: cursor
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所

- `src-tauri/shiori-host/src/main.rs:227` `let mut cursor_in = std::io::Cursor::new(input);`
- `src-tauri/shiori-host/src/main.rs:230` `load_and_run(dll_path.to_str().unwrap(), &mut cursor_in, &mut out_ok),`
- `src-tauri/src/commands/install/utils.rs:154` `let mut cursor = std::io::Cursor::new(content);`
- `src-tauri/src/commands/install/utils.rs:155` `let map = parse_zip_entry_descript(&mut cursor);`
- `ui/css/balloon-window.css:42` `cursor: grab;`

# char\*.menuitem\*,ID

- **規格**: [char-star-.menuitem-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/char-star-.menuitem-star/) (ukadoc-spec/descript/shell/descript-txt/char-star-.menuitem-star.md)
- **検索語**: char
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/lib.rs:133` `commands::window::show_subchar_window,`
- `src-tauri/src/lib.rs:134` `commands::window::hide_subchar_window,`
- `src-tauri/src/lib.rs:135` `commands::window::set_character_scale,`
- `src-tauri/src/lib.rs:140` `commands::window::sync_character_balloon,`
- `src-tauri/src/commands/ext.rs:47` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`

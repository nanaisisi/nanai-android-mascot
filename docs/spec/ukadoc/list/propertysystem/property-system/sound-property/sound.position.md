# position

- **規格**: [sound.position.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/sound-property/sound.position/)
- **検索語**: position
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「position」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:26`  `let screen_pos = monitor.position();`
- `src-tauri/src/commands/window/menu_window.rs:43`  `let _ = menu_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {`
- `src-tauri/src/commands/window/menu_window.rs:63`  `.position(target_x, target_y)`
- `src-tauri/src/commands/window/menu_window.rs:114`  `let screen_pos = monitor.position();`
- `src-tauri/src/commands/window/menu_window.rs:132`  `let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {`

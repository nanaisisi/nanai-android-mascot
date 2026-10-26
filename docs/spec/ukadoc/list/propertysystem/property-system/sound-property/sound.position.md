# position

- **規格**: [sound.position.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/sound-property/sound.position/)
- **検索語**: position
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「position」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:26`  `let screen_pos = monitor.position();`
- `src-tauri/src/commands/window/menu_window.rs:43`  `let _ = menu_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {`
- `src-tauri/src/commands/window/menu_window.rs:63`  `.position(target_x, target_y)`
- `src-tauri/src/commands/window/menu_window.rs:114`  `let screen_pos = monitor.position();`
- `src-tauri/src/commands/window/menu_window.rs:132`  `let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {`

# move

- **規格**: [move.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/move/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/move.md)
- **検索語**: move
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `src-tauri/src/events.rs:24` `tauri::async_runtime::spawn(async move {`
- `src-tauri/src/events.rs:67` `tauri::async_runtime::spawn_blocking(move || {`
- `src-tauri/src/lib.rs:84` `let _ = tauri::async_runtime::block_on(async move {`
- `src-tauri/src/lib.rs:94` `let builder = builder.on_menu_event(move |app_handle, event| {`
- `src-tauri/src/tray.rs:35` `.on_tray_icon_event(move |tray, event| {`

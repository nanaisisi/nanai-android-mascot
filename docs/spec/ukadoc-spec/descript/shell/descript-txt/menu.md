# menu,hidden

- **規格**: [menu.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu/) (ukadoc-spec/descript/shell/descript-txt/menu.md)
- **検索語**: menu
- **対応状況**: ⚠️ 一部対応

## 突合結果

src-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。

## 実装箇所

- `src-tauri/src/events.rs:4` `pub fn handle_menu_event(app_handle: &tauri::AppHandle, event: tauri::menu::Menu`
- `src-tauri/src/events.rs:8` `"native-menu-action",`
- `src-tauri/src/events.rs:16` `"native-menu-action",`
- `src-tauri/src/events.rs:41` `"native-menu-action",`
- `src-tauri/src/commands/config.rs:7` `use tauri::menu::{MenuBuilder, SubmenuBuilder};`

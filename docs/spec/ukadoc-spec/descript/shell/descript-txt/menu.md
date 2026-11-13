# menu,hidden

- **規格**: [menu.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu/) (ukadoc-spec/descript/shell/descript-txt/menu.md)
- **検索語**: menu
- **対応状況**: ✅ 実装済

## 突合結果

src-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:112` `self.get("menu.background.bitmap.filename")`
- `src-tauri/src/events.rs:4` `pub fn handle_menu_event(app_handle: &tauri::AppHandle, event: tauri::menu::Menu`
- `ui/main.ts:25` `import { menuMethods } from "./ts/ui/app-menu.js";`
- `ui/index.html:32` `<div class="top-right-menu">`
- `tests/app-actions.test.ts:160` `handle("close-menu");`
- `crates/nanai-core/src/descript_parser.rs:113` `.or_else(|| self.get("menu.background.bitmap"))`

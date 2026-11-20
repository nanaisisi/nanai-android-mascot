# エクスプローラ：右クリック/機能メニュー

- **規格**: [explorer/menu.md](../../../../../docs/ukadoc-ssp/functions/explorer/menu.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/explorer/menu/))
- **対応状況**: ✅ 実装済

docs/ukadoc-ssp/functions/explorer/menu.md の仕様項目一覧。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [共通する項目](menu/section-01.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/menu.md の「共通する項目」 |
| [ゴーストの項目](menu/section-02.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/menu.md の「ゴーストの項目」 |
| [バルーンの項目](menu/section-03.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/menu.md の「バルーンの項目」 |
| [シェルの項目](menu/section-04.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/menu.md の「シェルの項目」 |
| [ヘッドラインの項目](menu/section-05.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/menu.md の「ヘッドラインの項目」 |
| [プラグインの項目](menu/section-06.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/menu.md の「プラグインの項目」 |

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:112` `self.get("menu.background.bitmap.filename")`
- `src-tauri/src/events.rs:4` `pub fn handle_menu_event(app_handle: &tauri::AppHandle, event: tauri::menu::Menu`
- `ui/main.ts:25` `import { menuMethods } from "./ts/ui/app-menu.js";`
- `ui/index.html:32` `<div class="top-right-menu">`
- `tests/app-actions.test.ts:160` `handle("close-menu");`
- `crates/nanai-core/src/descript_parser.rs:113` `.or_else(|| self.get("menu.background.bitmap"))`

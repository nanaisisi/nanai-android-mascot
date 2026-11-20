# menu.background.bitmap.filename,ファイル名

- **規格**: [menu.background.bitmap.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.background.bitmap.filename/) (ukadoc-spec/descript/shell/descript-txt/menu.background.bitmap.filename.md)
- **検索語**: menu.background.bitmap.filename
- **対応状況**: ✅ 実装済

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:126` `/// メニュー背景画像ファイル名 (`menu.background.bitmap.filename`または`menu.background.bitmap`
- `src-tauri/src/ghost/scan/shell/theme.rs:43` `.get("menu.background.bitmap.filename")`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:35` `{ resource: "menu.background.bitmap.filename", field: "background_bitmap" },`
- `tests/menu-theme-shiori.test.ts:49` `"menu.background.bitmap.filename": "master_bg.png",`
- `crates/nanai-core/src/descript_parser/types.rs:128` `self.get("menu.background.bitmap.filename")`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:295` `Boolean(shioriResources?.["menu.background.bitmap.filename"]?.trim()),`

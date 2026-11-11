# menu.font.height,フォントサイズ

- **規格**: [menu.font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/menu.font.height.md)
- **検索語**: menu.font.height
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `menu.font.height` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:40` `let font_height = merged.get("menu.font.height").cloned();`
- `src-tauri/src/shiori/property/tests.rs:126` `assert_eq!(evaluate_property_query("menu.font.height"), "12");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:76` `"menu.font.height" => "12",`

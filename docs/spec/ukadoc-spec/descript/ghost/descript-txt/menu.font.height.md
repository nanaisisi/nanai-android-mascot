# menu.font.height,フォントサイズ

- **規格**: [menu.font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/menu.font.height.md)
- **検索語**: menu.font.height
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/shell/theme.rs` および SHIORI プロパティ評価系において `menu.font.height` のパース、シェルテーママージ、プロパティ返却が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:40` `let font_height = merged.get("menu.font.height").cloned();`
- `src-tauri/src/shiori/property/tests.rs:150` `assert_eq!(evaluate_property_query("menu.font.height"), "12");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:62` `"menu.font.height" => "12",`

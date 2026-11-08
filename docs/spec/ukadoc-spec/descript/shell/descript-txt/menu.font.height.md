# menu.font.height,フォントサイズ

- **規格**: [menu.font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.font.height/) (ukadoc-spec/descript/shell/descript-txt/menu.font.height.md)
- **検索語**: menu.font.height
- **対応状況**: ✅ 実装済

実装コード内に「menu.font.height」は検出されませんでした。


## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:40` `let font_height = merged.get("menu.font.height").cloned();`
- `src-tauri/src/shiori/property.rs:106` `"menu.font.height" => "12".to_string(),`
- `src-tauri/src/shiori/property.rs:328` `assert_eq!(evaluate_property_query("menu.font.height"), "12");`

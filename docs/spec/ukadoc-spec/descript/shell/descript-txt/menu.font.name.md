# menu.font.name,フォント名

- **規格**: [menu.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.font.name/) (ukadoc-spec/descript/shell/descript-txt/menu.font.name.md)
- **検索語**: menu.font.name
- **対応状況**: ⚠️ 一部対応

実装コード内に「menu.font.name」は検出されませんでした。


## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:39` `let font_name = merged.get("menu.font.name").cloned();`
- `src-tauri/src/shiori/property/tests.rs:125` `assert_eq!(evaluate_property_query("menu.font.name"), "sans-serif");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:75` `"menu.font.name" => "sans-serif",`

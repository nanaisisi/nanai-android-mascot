# menu.font.name,フォント名

- **規格**: [menu.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/menu.font.name.md)
- **検索語**: menu.font.name
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `menu.font.name` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:39` `let font_name = merged.get("menu.font.name").cloned();`
- `src-tauri/src/shiori/property.rs:105` `"menu.font.name" => "sans-serif".to_string(),`
- `src-tauri/src/shiori/property.rs:327` `assert_eq!(evaluate_property_query("menu.font.name"), "sans-serif");`

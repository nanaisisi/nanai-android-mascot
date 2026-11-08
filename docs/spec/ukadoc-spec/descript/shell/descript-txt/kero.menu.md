# kero.menu,autoまたはhidden

- **規格**: [kero.menu.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.menu/) (ukadoc-spec/descript/shell/descript-txt/kero.menu.md)
- **検索語**: kero.menu
- **対応状況**: ✅ 実装済

実装コード内に「kero.menu」は検出されませんでした。

## 実装箇所

- `src-tauri/src/shiori/property.rs:104` `"sakura.menu" | "kero.menu" => "auto".to_string(),`
- `src-tauri/src/shiori/property.rs:124` `|| s.starts_with("kero.menuitem")`
- `src-tauri/src/shiori/property.rs:326` `assert_eq!(evaluate_property_query("kero.menu"), "auto");`
- `src-tauri/src/shiori/property.rs:340` `assert_eq!(evaluate_property_query("kero.menuitemex1"), "");`

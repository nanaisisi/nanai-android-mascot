# sakura.menu,autoまたはhidden

- **規格**: [sakura.menu.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.menu/) (ukadoc-spec/descript/shell/descript-txt/sakura.menu.md)
- **検索語**: sakura.menu
- **対応状況**: ✅ 実装済

実装コード内に「sakura.menu」は検出されませんでした。


## 実装箇所

- `src-tauri/src/shiori/property.rs:104` `"sakura.menu" | "kero.menu" => "auto".to_string(),`
- `src-tauri/src/shiori/property.rs:123` `s if s.starts_with("sakura.menuitem")`
- `src-tauri/src/shiori/property.rs:325` `assert_eq!(evaluate_property_query("sakura.menu"), "auto");`
- `src-tauri/src/shiori/property.rs:339` `assert_eq!(evaluate_property_query("sakura.menuitem0"), "");`

# sakura.menu,autoまたはhidden

- **規格**: [sakura.menu.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.menu/) (ukadoc-spec/descript/shell/descript-txt/sakura.menu.md)
- **検索語**: sakura.menu
- **対応状況**: ⚠️ 一部対応

実装コード内に「sakura.menu」は検出されませんでした。


## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:123` `assert_eq!(evaluate_property_query("sakura.menu"), "auto");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:74` `"sakura.menu" | "kero.menu" => "auto",`

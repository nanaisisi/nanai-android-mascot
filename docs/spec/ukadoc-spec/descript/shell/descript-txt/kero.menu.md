# kero.menu,autoまたはhidden

- **規格**: [kero.menu.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.menu/) (ukadoc-spec/descript/shell/descript-txt/kero.menu.md)
- **検索語**: kero.menu
- **対応状況**: ⚠️ 一部対応

実装コード内に「kero.menu」は検出されませんでした。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:124` `assert_eq!(evaluate_property_query("kero.menu"), "auto");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:74` `"sakura.menu" | "kero.menu" => "auto",`

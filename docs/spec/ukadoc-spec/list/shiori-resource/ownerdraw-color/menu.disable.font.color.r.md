# menu.disable.font.color.r

- **規格**: [menu.disable.font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ownerdraw-color/menu.disable.font.color.r/) (ukadoc-spec/list/shiori-resource/ownerdraw-color/menu.disable.font.color.r.md)
- **検索語**: menu.disable.font.color.r
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「menu.disable.font.color.r」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:135` `assert_eq!(evaluate_property_query("menu.disable.font.color.r"), "128");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:86` `"menu.disable.font.color.r" => "128",`

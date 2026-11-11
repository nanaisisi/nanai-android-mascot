# font.color.r,数値

- **規格**: [font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.r.md)
- **検索語**: font.color.r
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:130` `assert_eq!(evaluate_property_query("menu.background.font.color.r"), "0");`
- `src-tauri/src/shiori/property/tests.rs:132` `evaluate_property_query("menu.foreground.font.color.r"),`
- `src-tauri/src/shiori/property/tests.rs:135` `assert_eq!(evaluate_property_query("menu.disable.font.color.r"), "128");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:80` `"menu.background.font.color.r" => "0",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:83` `"menu.foreground.font.color.r" => "255",`

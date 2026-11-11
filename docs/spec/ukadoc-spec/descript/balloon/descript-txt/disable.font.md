# disable.font.(フォント定義),(指定)

- **規格**: [disable.font.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/disable.font.md)
- **検索語**: disable.font
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["disable.font"]` を検出し、`--balloon-disable-font` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:36` `let dis_font_col = parse_color("menu.disable.font.color");`
- `src-tauri/src/shiori/property/tests.rs:135` `assert_eq!(evaluate_property_query("menu.disable.font.color.r"), "128");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:86` `"menu.disable.font.color.r" => "128",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:87` `"menu.disable.font.color.g" => "128",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:88` `"menu.disable.font.color.b" => "128",`

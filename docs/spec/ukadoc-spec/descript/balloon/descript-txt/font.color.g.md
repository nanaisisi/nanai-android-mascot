# font.color.g,数値

- **規格**: [font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.g.md)
- **検索語**: font.color.g
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:126` `/// バルーンフォントカラー (RGB) (`font.color.r`, `font.color.g`, `font.color.b`)`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:81` `"menu.background.font.color.g" => "0",`
- `ui/ts/core/actions/balloon-descript/font/group.ts:12` `* [anchor.font.color.r,数値], [anchor.font.color.g,数値], [anchor.font.color.b,数値]`
- `ui/ts/ui/spec-compliance-runner.ts:405` `"font.color.g": "48",`
- `tests/balloon-cycle9-robustness.test.ts:17` `"font.color.g": "-50",`
- `crates/nanai-core/src/descript_parser.rs:129` `let g = self.get("font.color.g").and_then(|v| v.parse::<u8>().ok());`

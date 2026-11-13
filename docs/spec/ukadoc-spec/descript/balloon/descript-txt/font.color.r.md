# font.color.r,数値

- **規格**: [font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.r.md)
- **検索語**: font.color.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:126` `/// バルーンフォントカラー (RGB) (`font.color.r`, `font.color.g`, `font.color.b`)`
- `src-tauri/src/shiori/property/tests.rs:130` `assert_eq!(evaluate_property_query("menu.background.font.color.r"), "0");`
- `ui/ts/core/actions/balloon-descript/font/group.ts:5` `* UKADOC仕様 (anchor.style, anchor.blendmethod, anchor.font.color.r/g/b, anchor.fo`
- `ui/ts/ui/spec-compliance-runner.ts:404` `"font.color.r": "32",`
- `tests/balloon-cycle9-robustness.test.ts:16` `"font.color.r": "300",`
- `crates/nanai-core/src/descript_parser.rs:128` `let r = self.get("font.color.r").and_then(|v| v.parse::<u8>().ok());`

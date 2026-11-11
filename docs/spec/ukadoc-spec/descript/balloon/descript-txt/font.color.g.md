# font.color.g,数値

- **規格**: [font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.g.md)
- **検索語**: font.color.g
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:81` `"menu.background.font.color.g" => "0",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:84` `"menu.foreground.font.color.g" => "255",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:87` `"menu.disable.font.color.g" => "128",`
- `ui/ts/core/actions/balloon-descript/font/group.ts:12` `* [anchor.font.color.r,数値], [anchor.font.color.g,数値], [anchor.font.color.b,数値]`
- `ui/ts/core/actions/balloon-descript/font/group.ts:19` `* [anchor.visited.font.color.r,数値], [anchor.visited.font.color.g,数値], [anchor.vi`
